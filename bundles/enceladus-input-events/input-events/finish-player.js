'use strict';

/**
 * Finish player creation. Add the character to the account then add the player
 * to the game world
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Player = require(srcPath + 'Player');

  return {
    event: state => (socket, args) => {
      let player = new Player({
        name: args.name,
        account: args.account,
        // TIP:DefaultAttributes: This is where you can change the default attributes for players
        attributes: {
          health: 100,
          Strength: 20,
          Fortitude: 20,
          Dexterity: 20,
          Reflexes: 20,
          Insight: 20,
          Sensitivity: 20,
          Spirit: 20,
          Luck: 20,
          armor: 0,
          dodge: 1,
          pulse: 100, //thinking the characters base atk speed, probably have a multiplying affect on weapon speeds.
          hitroll: 0,
          damroll: 0,
          critical: 1,
          criticalmultiplier: 1.5,
          magicfind: 0,
          healmod: 0,
          detection: 0,
          spellpower: 0,
          spiritpower: 0,
          focus: 100
        }
      });

      args.account.addCharacter(args.name);
      args.account.save();

      player.setMeta('class', args.playerClass);

      const room = state.RoomManager.startingRoom;
      player.room = room;
      player.save();

      // reload from manager so events are set
      player = state.PlayerManager.loadPlayer(state, player.account, player.name);
      player.socket = socket;

      socket.emit('done', socket, { player });
    }
  };
};
