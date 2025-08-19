import {  expect, test} from 'vitest';
import { ProofLeak } from '../src/index'
import fs from "fs";
import path from "path";
import {  generateEmailVerifierInputs   } from "@zk-email/zkemail-nr"
const inputParams = {
    extractFrom: true,
          extractTo: true,
  maxHeadersLength: 512,
  maxBodyLength: 1024,
};

const emails = {
  large: fs.readFileSync(
    path.join(__dirname, "./test-eml/testemail.eml")
  ),
};

test('Basic working',async () => {
  var pl = new ProofLeak();
        const inputs = await generateEmailVerifierInputs(
          emails.large,
          inputParams
        );
     const proof = await pl.prove(inputs);

     console.log(JSON.stringify(proof.publicOutputs));
     
     expect(proof).toBeTruthy();
});