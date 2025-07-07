import { UnifiedOCAProcessor, type StandardizedOCABranding } from '../../../packages/shared/src/oca/UnifiedOCAProcessor.js';

/**
 * Service for fetching OCA bundles from GitHub repositories
 * Uses unified OCA processing core for standardized branding extraction
 */
export class GitHubOCAService {
  /**
   * Fetch OCA bundle from GitHub repository URL using unified processor
   */
  async fetchFromGitHub(githubTreeUrl: string): Promise<StandardizedOCABranding> {
    return UnifiedOCAProcessor.fetchOCABundleFromGitHub(githubTreeUrl);
  }

  /**
   * Fetch multiple OCA bundles using unified processor
   */
  async fetchMultipleBundles(githubUrls: string[]): Promise<StandardizedOCABranding> {
    return UnifiedOCAProcessor.fetchMultipleBundles(githubUrls);
  }
}

export const githubOCAService = new GitHubOCAService();