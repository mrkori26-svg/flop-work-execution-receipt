export type ProvenanceAvailability=
  |"LIVE_PAGE"
  |"RETAINED_RING"
  |"LOCAL_SNAPSHOT"
  |"UNAVAILABLE"
  |"UNKNOWN_BOUNDED_SCAN";

export interface TransportProvenance{
  room?:string;
  generation?:number;
  seq?:number;
  availability:ProvenanceAvailability;
  canonical_bytes?:string;
  digest?:string;
}

export function validateTransportProvenance(value:TransportProvenance):TransportProvenance{
  if(value.room!==undefined&&!/^[a-z0-9][a-z0-9_-]{0,47}$/.test(value.room))throw new Error("INVALID_PROVENANCE_ROOM");
  if(value.generation!==undefined&&(!Number.isSafeInteger(value.generation)||value.generation<0))throw new Error("INVALID_PROVENANCE_GENERATION");
  if(value.seq!==undefined&&(!Number.isSafeInteger(value.seq)||value.seq<1))throw new Error("INVALID_PROVENANCE_SEQ");
  if(value.digest!==undefined&&!/^sha256:[0-9a-f]{64}$/.test(value.digest))throw new Error("INVALID_PROVENANCE_DIGEST");
  return structuredClone(value);
}

export function provenanceExtension(value:TransportProvenance):Record<string,unknown>{
  const validated=validateTransportProvenance(value);
  return{"technocore/provenance":validated};
}
