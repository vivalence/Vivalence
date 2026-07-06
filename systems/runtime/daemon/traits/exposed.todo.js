// assign mode aperture to mode.call = shape.object(mode.aperture)
// this requires all (daemon,clients) references of mode.call to be recast to mode.connection.call - which is better anyways in cases where its litterally that, and may require some semantic naming shuffling in cases where mode.call is connection.aimed()
