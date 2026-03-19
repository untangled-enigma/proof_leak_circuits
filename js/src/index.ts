import { CircuitInput } from "@zk-email/zkemail-nr"
import { ZKWhistleblowerProver, ProvingBackend, generateInputs } from "./ZKWhistleblower"
import { isValidEml, extractEmailAddresses, extractEmail, domainSequence, domainInputs } from "./emailUtils"
import { BoundedVec, Sequence } from "@zk-email/zkemail-nr/dist/utils"

export { ZKWhistleblowerProver, generateInputs, isValidEml, extractEmailAddresses, domainSequence, extractEmail, domainInputs }

type zkWCircuitInputs = CircuitInput & {
    to_domain_sequence: Sequence;
    from_domain_sequence: Sequence;
    domain: BoundedVec;
}

export type { ProvingBackend, zkWCircuitInputs } 