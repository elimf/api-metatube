import { promises as fsPromises } from 'fs';

class Utils {
  public async deleteFile(filePath: string): Promise<void> {
    try {
      // Supprimez le fichier du chemin spécifié
      await fsPromises.unlink(filePath);
      console.log(`Fichier supprimé avec succès : ${filePath}`);
    } catch (err) {
      console.error(
        `Erreur lors de la suppression du fichier ${filePath}:`,
        err,
      );
    }
  }
}

export default Utils;
