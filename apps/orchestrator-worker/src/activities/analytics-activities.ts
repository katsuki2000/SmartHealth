import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function runPySparkAnalytics(): Promise<string> {
  console.log(`[Activity] Starting PySpark analytics script...`);
  
  // Absolute path to the PySpark script.
  // From apps/orchestrator-worker/src/activities, we go up to the monorepo root
  const scriptPath = path.resolve(__dirname, '../../../../apps/analysis-engine/src/pathology_by_age.py');
  
  console.log(`   -> Script path: ${scriptPath}`);

  try {
    // Execute the Python script. Uses the virtual environment if available, otherwise just python.
    // Execution may take a few dozen seconds because PySpark is heavy.
    // PYTHONIOENCODING=utf-8 is essential on Windows so special characters don't crash child_process.exec
    const { stdout, stderr } = await execAsync(`python "${scriptPath}"`, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
    
    console.log(`[Activity] PySpark script completed successfully!`);
    if (stdout) {
      console.log(`\n--- PySpark Output ---\n${stdout.substring(0, 500)}...\n----------------------`);
    }
    
    if (stderr && !stderr.includes('WARN')) {
      console.warn(`[Activity] Warnings (stderr):\n${stderr.substring(0, 300)}...`);
    }
    
    return 'Analytics completed successfully';
  } catch (error: any) {
    console.error(`[Activity] Error during PySpark execution:`);
    console.error(error.message);
    throw new Error(`PySpark execution failed: ${error.message}`);
  }
}
