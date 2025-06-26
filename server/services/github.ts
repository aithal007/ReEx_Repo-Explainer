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
