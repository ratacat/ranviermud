'use strict';


/**
 * Resume player playing after a pause, allow the player to actually execute commands
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Logger = require(srcPath + 'Logger');
 // const PlayerConditions = require(srcPath + 'PlayerConditions');

  return {
    event: state => (socket, args) => {
      let player = args.player;

      Logger.log(player.name + ' retornou.');

      player.save();
   //   player.condition = PlayerConditions.PLAYING;
      Broadcast.prompt(player);

      // All that shit done, let them play!
      player.socket.emit('commands', player);
    }
  };
};