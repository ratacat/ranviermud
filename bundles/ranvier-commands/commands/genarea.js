'use strict';

const Axo = require('axolemma');

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const PlayerRoles = require(srcPath + 'PlayerRoles');

  const Room = require(srcPath + 'Room');
  const Area = require(srcPath + 'Area');

  return {
    requiredRole: PlayerRoles.ADMIN,

    command: state => (args, player) => {
      const { AreaManager, RoomManager } = state;
      const bundle = 'axo-test';
      //const name = args.split(' ').join('-');
      let parts = args.split(' ');
      if (parts.length === 1) {
        var manifest = {title: parts[0] };
        var name = parts[0];
        var mapType = 'Digger';
      } else if (parts.length === 2) {
        var manifest = {title: parts[0] };
        var name = parts[0]
        var mapType = parts[1];
      } else if (parts.length === 0) {
        var name = 'Generated';
        var manifest = {title: 'Generated' };
        var mapType = 'Digger';
      }
      

      const {graphic, rooms} = Axo.generate({
        type: mapType,
        areaTitle: manifest.title,
        roomDugPercentage: '10'
      });

      Broadcast.sayAt(player, 'Generated: ');
      Broadcast.sayAt(player, graphic);

      const newArea = new Area(bundle, name, manifest);
      const newRooms = rooms.map(room =>
        new Room(
          newArea,
          Object.assign(
            room,
            {metadata: { axolemmaGenerated: true }})
        )
      );

      newRooms.forEach(room =>{
        newArea.addRoom(room);
        RoomManager.addRoom(room);
        room.hydrate(state);
        console.log('Finished with: ', room);
      });


      AreaManager.addArea(newArea);
      Broadcast.sayAt(player, `New area created as instance: ${name}`);
      Broadcast.sayAt(player, `Try teleporting to ${newRooms[0].entityReference}`);
    }
  };
};