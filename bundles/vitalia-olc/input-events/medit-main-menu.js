'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require('fs');

/**
 * Mob edit - Main menu
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const Data      = require(srcPath + 'Data');
  const CharSlots = require(srcPath + 'CharSlots');
  const NpcTypes = require(srcPath + 'NpcTypes');
  const NpcSizes = require(srcPath + 'NpcSizes');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const area     = args.areaRef;
      const player   = args.player;
      let   mobFile  = args.parsed;
      const filepath = args.filepath;
      const areaPath = args.areaPath;

      let options = [];
      if (!mob.metadata) mob.metadata = {};
      options.push({ display: `-- Mob [<cyan>${area.name}:${mob.id}</cyan>]` });

      options.push({
        display: `Nome : <yellow>${mob.name}</yellow>`,
        onSelect: () => {
          write('Entre com o nome: ');
          socket.once('data', name => {
            name = name.toString().trim();
            if (name == '') {
              args.errorMsg = 'O nome é obrigatório!';
            } else {
              mob.name = name;
            }
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      if (!mob.metadata.gender) mob.metadata.gender = 0;
      const genderDisplay = mob.metadata.gender == 'male' ? 'Masculino' : mob.metadata.gender == 'female' ? 'Feminino' : 'Neutro';
      options.push({
        display: `Gênero : <yellow>${genderDisplay}</yellow>`,
        onSelect: () => {
          say('Gêneros: (<b>M</b>)asculino, (<b>F</b>)eminino e (<b>N</b>)eutro')
          write('Entre com o gênero (M/F/N): ');
          socket.once('data', gender => {
            gender = gender.toString().trim().toLowerCase();
            if (!/[mfn]/.test(gender)) {
              args.errorMsg = 'Gênero inválido!';
              return socket.emit('medit-main-menu', socket, mob, args);
            }
            mob.metadata.gender = gender == 'm' ? 'male' : gender == 'f' ? 'female' : 'neutral';
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      options.push({
        display: `Palavras-chaves : <yellow>${typeof mob.keywords == 'undefined' || mob.keywords == '' ? '<red>Nenhum!!!</red>': mob.keywords}</yellow>`,
        onSelect: () => {
          write('Entre com TODAS palavras-chaves (Separadas por virgula, sem espaço): ');
          socket.once('data', keywords => {
            mob.keywords = (keywords.toString().trim()).split(',');
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      options.push({
        display: `Descrição na sala : <yellow>${mob.roomDesc || '<red>Sem descrição na sala</red>'}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (No chão da sala): ');
          socket.once('data', roomDesc => {
            mob.roomDesc = roomDesc.toString().trim();
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      options.push({
        display: `Descrição : <yellow>${mob.description}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (Sem quebras de linha): ');
          socket.once('data', description => {
            mob.description = description.toString().trim();
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      let extraDescs = '';
      for (let desc in mob.extraDescs) {
        extraDescs += extraDescs != '' ? ',' + desc : desc;
      }
      options.push({
        display: `Descrições extras : <yellow>${extraDescs != '' ? extraDescs : '<Nenhuma>'}</yellow>`,
        onSelect: () => {
          return socket.emit('medit-extradesc-menu', socket, mob, args);
        },
      });

      if (!mob.metadata.alignment) mob.metadata.alignment = 0;
      options.push({
        display: `Alinhamento : <yellow>${mob.metadata.alignment}</yellow>`,
        onSelect: () => {
          write('Entre com o alinhamento: ');
          socket.once('data', align => {
            align = parseInt(align, 10);
            if (isNaN(align) || align < -1000 || align > 1000) {
              args.errorMsg = 'Alinhamento inválido!';
              return socket.emit('medit-main-menu', socket, mob, args);
            }
            mob.metadata.alignment = align;
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      if (!mob.metadata.tier) mob.metadata.tier = 0;
      options.push({
        display: `Tier : <yellow>${mob.metadata.tier}</yellow>`,
        onSelect: () => {
          write('Entre com o tier: ');
          socket.once('data', tier => {
            tier = parseInt(tier, 10);
            if (isNaN(tier) || tier < 0 || tier > 100) {
              args.errorMsg = 'Tier inválido!';
              return socket.emit('medit-main-menu', socket, mob, args);
            }
            mob.metadata.tier = tier;
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      if (!mob.metadata.type) mob.metadata.type = '';
      options.push({
        display: `Tipo : <yellow>${mob.metadata.type != '' ? NpcTypes[mob.metadata.type].name : 'Indefinido' }</yellow>`,
        onSelect: () => {
          return socket.emit('medit-type-menu', socket, mob, args);
        },
      });

      if (!mob.metadata.size) mob.metadata.size = '';
      options.push({
        display: `Tamanho : <yellow>${mob.metadata.size != '' ? NpcSizes[mob.metadata.size].name : 'Indefinido' }</yellow>`,
        onSelect: () => {
          return socket.emit('medit-size-menu', socket, mob, args);
        },
      });

      // Flags
      if (typeof mob.metadata.npcFlags == 'undefined') {
        mob.metadata.npcFlags = [];
      }

      let actualFlags = mob.metadata.npcFlags.join(' ');
      if (actualFlags == '') {
        actualFlags = '<Nenhuma>';
      }

      options.push({
        display: `Flags : <yellow>${actualFlags}</yellow>`,
        onSelect: () => {
          return socket.emit('medit-flags-menu', socket, mob, args);
        },
      });

      // Afetamentos
      if (typeof mob.metadata.affFlags == 'undefined') {
        mob.metadata.affFlags = [];
      }

      let actualAffects = mob.metadata.affFlags.join(' ');
      if (actualAffects == '') {
        actualAffects = '<Nenhuma>';
      }

      options.push({
        display: `Afetamentos : <yellow>${actualAffects}</yellow>`,
        onSelect: () => {
          return socket.emit('medit-affects-menu', socket, mob, args);
        },
      });

      options.push({
        display: `Behaviors : <yellow>${mob.behaviors ? JSON.stringify(mob.behaviors) : '<Nenhum>'}</yellow>`,
        onSelect: () => {
          args.errorMsg = 'Ainda em construção!';
          //return socket.emit('medit-behaviors-menu', socket, mob, args);
          return socket.emit('medit-main-menu', socket, mob, args);
        },
      });

      options.push({
        display: `Script : <yellow>${mob.script || '<Nenhum>'}</yellow>`,
        onSelect: () => {
          // Validacao da existencia do script?
          write('Entre com o script: ');
          socket.once('data', script => {
            script = script.toString().trim();

            if (script != '') {
              const scriptPath = areaPath + '/scripts/npcs/' + script + '.js';
              if (!fs.existsSync(scriptPath)) {
                args.errorMsg = 'Script inexistente: ' + area.name + '/scripts/npcs/' + script + '.js';
                return socket.emit('medit-main-menu', socket, mob, args);
              }
            }

            mob.script = script;
            return socket.emit('medit-main-menu', socket, mob, args);
          });
        },
      });

      if (!mob.metadata.position_load) mob.metadata.position_load = 'STANDING';
      options.push({
        display: `Posição Carregamento : <yellow>[${mob.metadata.position_load}]</yellow>`,
        onSelect: () => {
          args.position = 'position_load';
          return socket.emit('medit-position-menu', socket, mob, args);
        },
      });

      if (!mob.metadata.position_default) mob.metadata.position_default = 'STANDING';
      options.push({
        display: `Posição Padrão : <yellow>[${mob.metadata.position_default}]</yellow>`,
        onSelect: () => {
          args.position = 'position_default';
          return socket.emit('medit-position-menu', socket, mob, args);
        },
      });

      options.push({
        display: 'Atributos :',
        onSelect: () => {
          return socket.emit('medit-attributes-menu', socket, mob, args);
        }
      });
      if (mob.attributes) {
        for (let mod in mob.attributes) {
          options.push({ display: sprintf("<green>%15s</green> : <yellow>%s</yellow>", mod.toUpperCase(), mob.attributes[mod])});
        }
      }

      options.push({
        display: 'Equipamento/Inventário :',
        onSelect: () => {
          return socket.emit('medit-items-menu', socket, mob, args);
        },
      });
      
      if (mob.inventory) {
        for (let inv of mob.inventory) {
          for (let invItem in inv) {
            const item = state.ItemFactory.getDefinition(invItem);
            options.push({ display: sprintf("  [<green>Invent.</green>] [<green>%s</green>] : <yellow>%s</yellow> : %s%%", item ? item.name : 'Indef', invItem, inv[invItem])});
          }
        }
      }

      if (mob.equipment) {
        for (let entry in mob.equipment) {
          for (let eq in mob.equipment[entry]) {
            const equip = state.ItemFactory.getDefinition(eq);
            options.push({ display: sprintf("  [<green>%7s</green>] %15s : [<green>%s</green>] : <yellow>%s</yellow> : %s%%", entry, CharSlots[entry].equipDesc, equip ? equip.name : 'Indef', eq, mob.equipment[entry][eq])});
          }
        }
      }

      let quit = [];
      quit.push({
        display: `Sair`,
        onSelect: () => {
          write('Deseja salvar as alterações no mob? [<b>s/N</b>]: ');
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[sn]/.test(confirmation)) {
              return socket.emit('medit-main-menu', socket, mob, args);
            }

            if (confirmation === 's') {
              mob.metadata.last_edited = Date.now();
              mob.metadata.last_edited_by = player.name;
              Data.saveFile(filepath, mobFile);
              state.MobFactory.setDefinition(area.name + ':' + mob.id, mob);
              /* -- Moreli: Não vou ligar pra recarregar o script agora
              if (mob.script) {
                const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + mob.script + '.js';
                if (fs.existsSync(scriptPath)) {
                  this.loadEntityScript(this.state.ItemFactory, entityRef, scriptPath);
                }
              }
              */
              say(`<green>Alterações salvas.</green>`);
            } else {
              say('Alterações descartadas.');
            }

            player.socket.emit('resume-playing', player.socket, { player });
            //Broadcast.prompt(player);
          });
        },
      });

      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          say(`[<green>${optionI < 10 ? ' ' : ''}${optionI}</green>] ${opt.display}`);
        } else {
          say(`${opt.display}`);
        }
      });

      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }
      write('Entre com a opção : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('medit-main-menu', socket, mob, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado medit main menu:' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('medit-main-menu', socket, mob, args);
      });
    }
  };
};
