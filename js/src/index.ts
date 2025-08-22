import { ZKEmailProver } from "@zk-email/zkemail-nr/dist/prover.js"
import circuit from "../../target/proof_leak_contracts.json"
import { generateEmailVerifierInputs } from "@zk-email/zkemail-nr"
import os from 'os';

const threads = os.cpus().length ;

export class ProofLeak {
      private prover?: any;

      constructor() {
            //@ts-ignore
            this.prover = new ZKEmailProver(circuit, "plonk", threads);
      }

      async prove(inputs: any): Promise<any> {
            return await this.prover.fullProve(inputs);
      }

      async verify(proof: any): Promise<any> {
            return await this.prover.verify(proof);
      }

      async generateInputs(emlfile:any) {
            const inputParams = {
                  extractFrom: true,
                  extractTo: true,
                  maxHeadersLength: 1024,
                  maxBodyLength: 1024,
            };
          return await generateEmailVerifierInputs(
                  emlfile,
                  inputParams
            );
      }

}

