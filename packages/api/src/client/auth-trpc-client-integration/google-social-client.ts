import { signInGoogleUserOrThrow } from "./client-utils";

async function main() {
    await signInGoogleUserOrThrow();
}

main();