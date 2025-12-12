import { BoundedVec, Sequence } from '@zk-email/zkemail-nr/dist/utils';
import { ParsedEmlJson, parseEml, readEml } from 'eml-parse-js'

export type EmailAddress = {
  domain: string;
  address: string
}

export type ExtractedEmailAddresses = {
  to: EmailAddress;
  from: EmailAddress;
}

export function isValidEml(fileContent: string) {

  const parsedEml = readEml(fileContent);

  //@ts-ignore
  const to = extractEmail(parsedEml.headers.To)
  //@ts-ignore
  const from = extractEmail(parsedEml.headers.From)

  /*
   // TODO: verfy bodyHash locally
   const parseEml = parseEmail(fileContent);
     const { canonicalizedBody, dkim } =
       parseEmailToCanonicalized(fileContent);
 
     if (!verifyBody(canonicalizedBody, dkim)) {
       throw new Error("Invalid eml. Siganture mismatch.");
     }
 
     const { to, from } = extractEmailAddresses(parseEml.headers);
 */
  if (to.domain !== from.domain) {
    throw new Error("from/to mismatch. Email should be an internal email. ");
  }

  return to.domain;
}

export function extractEmailAddresses(fileContent: string): ExtractedEmailAddresses {
  // const parsedEml = readEml(fileContent);
  const parsedEml = parseEml(fileContent) as ParsedEmlJson

  let parsedTo = extractAddressFromHeader(parsedEml.headers, "to")
  let parsedFrom = extractAddressFromHeader(parsedEml.headers, "from")

  // console.log(`\n parsed \n ${pEml.headers}`);

  if (typeof parsedEml == "string" || parsedEml instanceof Error) {
    throw new Error("Unable to extract")
  }

  //@ts-ignore
  const to = extractEmail(parsedTo)

  //@ts-ignore
  const from = extractEmail(parsedFrom)

  return { to, from }
}

export function domainSequence(bufHeader: any[], email: string  ) : Sequence {
  const rHead = Buffer.from(bufHeader).toString()
  const fromIndex = rHead.indexOf(email)
  // console.log(`\nindex ${fromIndex} \n char at index ${String.fromCharCode(+bufHeader[fromIndex])}`)

  const index = rHead.indexOf("@",fromIndex) + 1
  const endIndex = fromIndex + email.length
  const length = endIndex-index

  return {index : index.toString(),length : length.toString()}
}

export function extractEmail(email: string): EmailAddress {
  let indexofat = 0;
  for (let i = 0; i < email.length; i++) {
    if (email.charAt(i) == "@") {
      indexofat = i;
      break;
    }
  }

  // console.log({indexofat});

  let emailArr = ["@"], domainArr = [],
    j = indexofat - 1,
    k = indexofat + 1,
    breakj = true,
    breakk = true;

  while (breakj || breakk) {
    if (email.charAt(j) == "<" || email.charAt(j) == `'` || email.charAt(j) == `"`) {
      breakj = false;
    }
    if (email.charAt(k) == ">" || email.charAt(k) == `'` || email.charAt(k) == `"`) {
      breakk = false;
    }

    if (breakk) {
      emailArr.push(email.charAt(k));
      domainArr.push(email.charAt(k));
      k++;
    }
    if (breakj) {
      emailArr.unshift(email.charAt(j));
      j--;
    }
  }

  const parsedEmail = emailArr.join("");

  return { address: parsedEmail, domain: domainArr.join("") };
}

export function domainInputs(domain: string) : BoundedVec {
  let storage :  string[] = []
  
  for (let i = 0 ; i <domain.length ; i++ ) {
    storage.push(domain.charCodeAt(i) + "")
  }

  for (let i = domain.length ; i < 127 ; i++ ) {
    storage.push("0")
  }
  
  return {storage, len: storage.length + "" }
}

function extractAddressFromHeader(headers: any, selection: string ) : string {
  //capitalise first letter
  let selectionArray= selection.split("");
  selectionArray[0] = selectionArray[0].toUpperCase();
  const selection2 = selectionArray.join("")
  
  let address : string
   switch (true) {
    case headers.hasOwnProperty(selection):
      address = headers[selection];
      break
    case headers.hasOwnProperty(selection2):
      //@ts-ignore
      address = headers[selection2]
      break;
    default : 
      throw new Error("Unable to extract to email address")  
  }

  return address
  
}



