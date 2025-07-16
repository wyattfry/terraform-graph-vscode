import * as cp from 'child_process';

export class TerraformService {
    public static async generateGraph(workspacePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            cp.exec('terraform graph', { cwd: workspacePath }, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error('Failed to generate Terraform graph: ' + stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
