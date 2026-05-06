import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function runPySparkAnalytics(): Promise<string> {
  console.log(`📊 [Activity] Démarrage du script PySpark (Analytics)...`);
  
  // Chemin absolu vers le script PySpark.
  // Depuis apps/orchestrator-worker/src/activities, on remonte jusqu'à la racine du monorepo
  const scriptPath = path.resolve(__dirname, '../../../../apps/analysis-engine/src/pathology_by_age.py');
  
  console.log(`   → Script path: ${scriptPath}`);

  try {
    // Exécution du script Python. On s'assure d'utiliser l'environnement virtuel s'il existe ou juste python.
    // L'exécution peut prendre quelques dizaines de secondes car PySpark est lourd
    // PYTHONIOENCODING=utf-8 est essentiel sur Windows pour que les emojis et caractères spéciaux de PySpark ne fassent pas crasher child_process.exec
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    
    console.log(`✅ [Activity] Script PySpark terminé avec succès !`);
    if (stdout) {
      console.log(`\n--- PySpark Output ---\n${stdout.substring(0, 500)}...\n----------------------`);
    }
    
    if (stderr && !stderr.includes('WARN')) {
      console.warn(`⚠️ [Activity] Avertissements (stderr):\n${stderr.substring(0, 300)}...`);
    }
    
    return 'Analytics completed successfully';
  } catch (error: any) {
    console.error(`❌ [Activity] Erreur lors de l'exécution de PySpark:`);
    console.error(error.message);
    throw new Error(`PySpark execution failed: ${error.message}`);
  }
}
