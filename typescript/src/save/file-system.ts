const fs = require('fs');

export class FileSystem {

    public static writeFile(fileName: string, json: any): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, JSON.stringify(json) + "\n", 'utf8', err => {
                err ? reject(err) : resolve();
            });
        });
    }

    public static readFileSync(filename: string, defaultState = "{}"): string {
        try {
            return fs.readFileSync(filename, 'utf8');
        } catch (err) {
            console.error(err);
            return defaultState;
        }
    }
}