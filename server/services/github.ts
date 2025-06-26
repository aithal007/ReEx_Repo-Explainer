export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  url: string;
}

export function parseGitHubUrl(url: string): GitHubRepoInfo {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.hostname !== 'github.com') {
      throw new Error('URL must be from github.com');
    }

    const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }

    const owner = pathParts[0];
    const repo = pathParts[1];

    return { owner, repo, url };
  } catch (error) {
    throw new Error('Invalid GitHub repository URL');
  }
}

export async function fetchReadme(owner: string, repo: string): Promise<string> {
  const readmeUrls = [
    `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`,
  ];

  for (const url of readmeUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        if (content.trim().length > 0) {
          return content;
        }
      }
    } catch (error) {
      // Try next URL
      continue;
    }
  }

  throw new Error('README.md not found in this repository');
}

export async function validateRepository(owner: string, repo: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function fetchRepositoryStructure(owner: string, repo: string): Promise<string> {
  try {
    // Fetch repository tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`);
    if (!treeResponse.ok) {
      throw new Error('Failed to fetch repository structure');
    }
    
    const treeData = await treeResponse.json();
    const files = treeData.tree
      .filter((item: any) => item.type === 'blob')
      .map((item: any) => item.path)
      .slice(0, 100); // Limit to first 100 files

    return files.join('\n');
  } catch (error) {
    return 'Repository structure not available';
  }
}

export async function fetchKeyFiles(owner: string, repo: string): Promise<{ [key: string]: string }> {
  const keyFiles: { [key: string]: string } = {};
  
  const filesToFetch = [
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'requirements.txt',
    'Pipfile',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'composer.json',
    'Gemfile',
    'setup.py',
    'pyproject.toml',
    'CMakeLists.txt',
    'Makefile',
    'Dockerfile',
    'docker-compose.yml',
    '.gitignore',
    'LICENSE',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'tsconfig.json',
    'webpack.config.js',
    'vite.config.js',
    'next.config.js',
    'tailwind.config.js'
  ];

  for (const fileName of filesToFetch) {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${fileName}`);
      if (response.ok) {
        const content = await response.text();
        if (content.trim().length > 0 && content.trim().length < 10000) { // Limit file size
          keyFiles[fileName] = content;
        }
      } else {
        // Try master branch if main doesn't work
        const masterResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${fileName}`);
        if (masterResponse.ok) {
          const content = await masterResponse.text();
          if (content.trim().length > 0 && content.trim().length < 10000) {
            keyFiles[fileName] = content;
          }
        }
      }
    } catch (error) {
      // Continue to next file
      continue;
    }
  }

  return keyFiles;
}
