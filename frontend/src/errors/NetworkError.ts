export class NetworkError extends Error {
    constructor() {
        super("Sistema indisponível");
        this.name = "NetworkError";
    }
}
