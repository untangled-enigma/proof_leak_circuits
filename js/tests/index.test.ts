import { beforeAll, expect, it, test } from 'vitest';
import { ProofLeakProver, domainSequence, extractEmailAddresses } from '../src/index'
import fs from "fs";
import path from "path";
import ky from 'ky';
import { generateEmailVerifierInputs } from "@zk-email/zkemail-nr"
import os from 'os';

const inputParams = {
  extractFrom: true,
  extractTo: true,
  maxHeadersLength: 1024,
  maxBodyLength: 1024,
};
const threads = os.cpus().length;

const emails = {
  large: fs.readFileSync(
    path.join(__dirname, "./test-eml/testemail.eml")
  ),
  org: fs.readFileSync(
    path.join(__dirname, "./test-eml/my_org_email.eml")
  ),
};

let prover: ProofLeakProver;

beforeAll(async () => {
  prover = new ProofLeakProver('honk', threads);
})

test("generate inputes", async () => {

  const eml = emails.org
  const inputs = await generateEmailVerifierInputs(
    eml,
    inputParams
  );

  fs.writeFileSync(
    path.join(__dirname, "./test-eml/inputs_org.json"),
    JSON.stringify(inputs)
  )

  const extEmail = extractEmailAddresses(eml.toString())
  console.log(`extracted FROM\n ${extEmail.from.address} \n ${extEmail.from.domain}`);

  const fromDomainSeq = domainSequence(inputs.header.storage, extEmail.from.address)
  const toDomainSeq = domainSequence(inputs.header.storage, extEmail.to.address)

  expect(extEmail.from.domain.length).to.eq(+fromDomainSeq.length)
  expect(extEmail.to.domain.length).to.eq(+toDomainSeq.length)

  let dc = []
  for (var i = +fromDomainSeq.index; i < +fromDomainSeq.index + +fromDomainSeq.length; i++) {
    dc.push(String.fromCharCode(+inputs.header.storage[i]))
  }
  const rejoinedFromDomain = dc.join("")
  dc.length = 0
  for (var i = +toDomainSeq.index; i < +toDomainSeq.index + +toDomainSeq.length; i++) {
    dc.push(String.fromCharCode(+inputs.header.storage[i]))
  }

  const rejoinedToDomain = dc.join("")

  console.log(`rejoined domain ${dc.join("")}`);
  expect(rejoinedFromDomain).to.equal(extEmail.from.domain)
  expect(rejoinedToDomain).to.equal(extEmail.to.domain)

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


test.skip('Verify proof', async () => {
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