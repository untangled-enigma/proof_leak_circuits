use std::collections::bounded_vec::BoundedVec;
use zkemail::{
    dkim::RSAPubkey, headers::email_address::get_email_address, KEY_LIMBS_2048,
    MAX_EMAIL_ADDRESS_LENGTH, Sequence,
};

global MAX_EMAIL_HEADER_LENGTH: u32 = 1024;
/**
each of the three labels of any domain like (e.g. {www}.{example}.{com} )
 can be of up to 63 characters long

 so 63 + 63 + 1(for .) = 127
*/
global MAX_DOMAIN_LENGTH: u32 = 127

/**
 * Verify an arbitrary email signed by a 2048-bit RSA DKIM signature and extract sender and recipient addresses
 * @dev example of only constraining access to the header too
 *
 * @param header - The email header, 0-padded at end to the MAX_EMAIL_HEADER_LENGTH
 * @param pubkey - The DKIM RSA Public Key modulus and reduction parameter
 * @param signature - The DKIM RSA Signature
 * @param from_header_sequence - The index and length of the "From" header field
 * @param from_address_sequence - The index and length of the "From" email address
 * @param to_header_sequence - The index and length of the "To" header field
 * @param to_address_sequence - The index and length of the "To" email address
 * @return - 
 *         0: Pedersen hash of DKIM public key (root of trust)
 *         1: Pedersen hash of DKIM signature (email nullifier)
 */
fn main(
    header: BoundedVec<u8, MAX_EMAIL_HEADER_LENGTH>,
    pubkey: RSAPubkey<KEY_LIMBS_2048>,
    signature: [Field; KEY_LIMBS_2048],
    to_domain_sequence : Sequence,
    from_domain_sequence : Sequence,
    domain : pub BoundedVec<u8, MAX_DOMAIN_LENGTH>,
  //  from_header_sequence: Sequence,
  //  from_address_sequence: Sequence,
  //  to_header_sequence: Sequence,
  //  to_address_sequence: Sequence,
) -> pub (bool) {
    // check the body and header lengths are within bounds
    assert(header.len() <= MAX_EMAIL_HEADER_LENGTH);

    // verify the dkim signature over the header
    pubkey.verify_dkim_signature(header, signature);

    assert(to_domain_sequence.end_index() != from_domain_sequence.end_index(), "to/from pointing to same field");
    assert(to_domain_sequence.length == from_domain_sequence.length, "to/from domain length mismatch");

    // Safety: Checking domains
    unsafe {
    check_domain(header,domain,to_domain_sequence.index, from_domain_sequence.index,to_domain_sequence.length )
    }

  true
}

unconstrained fn check_domain( header:BoundedVec<u8, 1024>, domain: BoundedVec<u8, MAX_DOMAIN_LENGTH> , to_index: u32,from_index: u32, d_length: u32) {
 for i in 0 .. d_length {
      let header_to_char = header.get(to_index + i);
        assert(header_to_char == domain.get(i), "supplied pub domain does not match" );
        assert(header_to_char == header.get(from_index + i), "to/from domain does not match" )   
    }
}