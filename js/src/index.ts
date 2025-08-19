import { ZKEmailProver  } from "@zk-email/zkemail-nr/dist/prover.js"
import circuit from "../../target/proof_leak_contracts.json"
import os from "os";

const threads = os.cpus().length;

export class ProofLeak {
      private prover?: any;

    constructor() {
        //@ts-ignore
        this.prover = new ZKEmailProver(circuit, "plonk", threads);     

    }

   async prove(inputs:any) {
         return  await this.prover.fullProve(inputs);
   }

}

