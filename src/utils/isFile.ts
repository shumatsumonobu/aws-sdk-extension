import fs from 'fs';

/**
 * Checks whether the given path points to an existing file.
 * Returns `false` if the path does not exist or refers to a directory.
 *
 * @param {string} filePath Absolute or relative path to check.
 * @return {boolean} `true` if the path points to a regular file, `false` otherwise.
 */
export default (filePath: string): boolean => {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}
