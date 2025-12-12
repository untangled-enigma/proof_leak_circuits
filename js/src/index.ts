import { CircuitInput } from "@zk-email/zkemail-nr"
import {ProofLeakProver,ProvingBackend, generateInputs} from "./ProofLeakProver"
import { isValidEml , extractEmailAddresses, extractEmail, domainSequence, domainInputs} from "./emailUtils"
import { BoundedVec, Sequence } from "@zk-email/zkemail-nr/dist/utils"

export { ProofLeakProver, generateInputs,isValidEml,extractEmailAddresses,domainSequence, extractEmail, domainInputs}

type PLCircuitInputs = CircuitInput & {
    to_domain_sequence : Sequence;
    from_domain_sequence: Sequence;
    domain : BoundedVec;
}

export type {ProvingBackend,PLCircuitInputs} 