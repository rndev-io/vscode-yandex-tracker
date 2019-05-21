//@ts-ignore
import * as vscode from 'vscode';
import { keychain } from "./keychain";

class BaseError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}

export class SecretNotFound extends BaseError { }

export class Credentials {
    private extensionId: string;

    private host: string;

    constructor(extensionId: string, host: string) {
        this.extensionId = extensionId;
        this.host = host;
    }

    async token(): Promise<string | null> {
        return await keychain!.getPassword(this.extensionId, this.host);
    }

    async save(token: string) {
        await keychain!.setPassword(this.extensionId, this.host, token);
    }

    async clean() {
        await keychain!.deletePassword(this.extensionId, this.host);
    }
}