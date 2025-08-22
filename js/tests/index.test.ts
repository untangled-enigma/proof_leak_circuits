import { expect, test } from 'vitest';
import { ProofLeak } from '../src/index'
import fs from "fs";
import path from "path";
import ky from 'ky';

import { generateEmailVerifierInputs } from "@zk-email/zkemail-nr"
const inputParams = {
  // extractFrom: true,
  // extractTo: true,
  maxHeadersLength: 1024,
  maxBodyLength: 1024,
};

const emails = {
  large: fs.readFileSync(
    path.join(__dirname, "./test-eml/testemail.eml")
  ),
};

test.skip('Basic working', async () => {
  var pl = new ProofLeak();
  const inputs = await generateEmailVerifierInputs(
    emails.large,
    inputParams
  );
  const proof = await pl.prove(inputs);

  fs.writeFileSync(
    path.join(__dirname, "./test-eml/proof"),
    JSON.stringify(proof.proof)
  )

  expect(proof).toBeTruthy();
});

test('Convert proof base64', async () => {

  const bufproof = fs.readFileSync(path.join(__dirname, "./test-eml/proof"));
  const base64Proof = bufproof.toString("base64");

  console.log({base64Proof});
  
  //try to submit it to zkverify
  const params = {
    "proofType": "ultraplonk",
    "vkRegistered": true,
    "proofOptions": {
        "numberOfPublicInputs": 1 // Replace this for the number of public inputs your circuit support
    },
    "proofData": {
        "proof": base64Proof,
        "vk": process.env.VITE_VK_HASH
    }
}

const json = await ky.post(`${process.env.VITE_API_URL}/submit-proof/${process.env.VITE_API_KEY}`, {json: params}).json();

console.log(json);
})