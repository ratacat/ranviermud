// Require-able like any other library.
const Axolemma = require('axolemma')

const {manifest, graphic, rooms, yaml} = Axolemma.generate({ // Programmatically pass in options
  type: 'Uniform', // Uses ROT-js well-documented map generation algorithms.
  writeToFile: true, // Can write YAML definitions to file for static persistence
  weightedRoomsTable: require('./rooms-table')
})

// Returns an old-school ASCII map of your area.
console.log(graphic)

// Returns YAML string.
console.log(yaml)


// Returns area manifest as JS object.
//console.log(manifest)

// Returns Ranvier-compatible room definitions.
//const newRooms = rooms.map(
//  roomDef => new Room(roomDef)
//);