import { beforeAll, expect, test } from 'vitest';
import { ProofLeakProver } from '../src/index'
import fs from "fs";
import path from "path";
import ky from 'ky';
import { generateEmailVerifierInputs } from "@zk-email/zkemail-nr"
import os from 'os';

const inputParams = {
  // extractFrom: true,
  // extractTo: true,
  maxHeadersLength: 1024,
  maxBodyLength: 1024,
};
const threads = os.cpus().length;

const emails = {
  large: fs.readFileSync(
    path.join(__dirname, "./test-eml/testemail.eml")
  ),
};

let prover: ProofLeakProver;

beforeAll(async () => {
  prover = new ProofLeakProver('honk', threads);
})

test.skip('Generate Proof', async () => {
  const inputs = await generateEmailVerifierInputs(
    emails.large,
    inputParams
  );
  const proof = await prover.fullProve(inputs);

  fs.writeFileSync(
    path.join(__dirname, "./test-eml/proof"),
    JSON.stringify(proof.proof)
  )

  expect(proof).toBeTruthy();
});

test.skip('Generate Vk', async () => {
  const Vk = await prover.generateVk();
  fs.writeFileSync(
    path.join(__dirname, "./test-eml/noir-vkey.json"),
    JSON.stringify(Vk)
  );

})

test.skip('Register VK', async () => {

 // const bufVZk = fs.readFileSync(path.join(__dirname, "./test-eml/noir-vkey.json"));
  //const base64Vk = bufVZk.toString("base64");
  const Vk = await prover.generateVk();
  const base64Vk = Buffer.from(Vk).toString('base64');

//  if (!fs.existsSync(path.join(__dirname, "./test-eml/zkVerify-vkey.json"))) {
    // Registering the verification key
    try {
      const regParams = {
        "proofType": "ultrahonk",
        "vk": base64Vk
      }
      const regResponse = await ky.post(`${process.env.VITE_API_URL}/register-vk/${process.env.VITE_API_KEY}`, {
        timeout: 60_000,
        json: regParams
      });

      console.log({ regResponse });

      fs.writeFileSync(
        path.join(__dirname, "./test-eml/zkVerify-vkey.json"),
        JSON.stringify(regResponse)
      );

    } catch (error) {

      fs.writeFileSync(
        path.join(__dirname, "./test-eml/err-zkVerify-vkey.json"),
        JSON.stringify(error)
      )
    }
//  }

})

test('Verify proof', async () => {
  // const bufproof = fs.readFileSync(path.join(__dirname, "./test-eml/proof"));

  const inputs = await generateEmailVerifierInputs(
    emails.large,
    inputParams
  );
  const proof = await prover.fullProve(inputs);

  expect(await prover.verify(proof)).toBeTruthy;
})

test.skip('submit proof', async () => {

  const bufproof = fs.readFileSync(path.join(__dirname, "./test-eml/proof"));
  const base64Proof = bufproof.toString("base64");

  //console.log({base64Proof});

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

  const json = await ky.post(`${process.env.VITE_API_URL}/submit-proof/${process.env.VITE_API_KEY}`, { json: params }).json();

  console.log(json);
})