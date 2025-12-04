import { CircuitInput } from "@zk-email/zkemail-nr"
import {ProofLeakProver,ProvingBackend, generateInputs} from "./ProofLeakProver"
import { isValidEml , extractEmailAddresses, extractEmail, domainSequence} from "./emailUtils"
import { Sequence } from "@zk-email/zkemail-nr/dist/utils"

export { ProofLeakProver, generateInputs,isValidEml,extractEmailAddresses,domainSequence, extractEmail}

type PLCircuitInputs = CircuitInput & {
    to_domain_sequence : Sequence;
    from_domain_sequence: Sequence;
}

export type {ProvingBackend,PLCircuitInputs} 