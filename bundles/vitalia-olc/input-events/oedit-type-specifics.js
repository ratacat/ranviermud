'use strict';

/**
 * Item edit - Item Type menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const ItemType  = require(srcPath + 'ItemType');
 // const WeaponMessages = require(srcPath + 'WeaponMessages');
 // const LiquidType = require(srcPath + 'LiquidType');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const player   = args.player;

      if (!args.question) args.question = 0;
      const question = args.question;

      if (question == 0) {
        obj.properties.last_edited_prop = Date.now();
        obj.properties.last_edited_by_prop = player.name;
        delete obj.properties.light_duration;
        delete obj.properties.scroll_level;
        delete obj.properties.scroll_spell_2;
        delete obj.properties.scroll_spell_3;
        delete obj.properties.scroll_spell_1;
        delete obj.properties.potion_level;
        delete obj.properties.potion_spell_2;
        delete obj.properties.potion_spell_3;
        delete obj.properties.potion_spell_1;
        delete obj.properties.staff_level;
        delete obj.properties.staff_max;
        delete obj.properties.staff_actual;
        delete obj.properties.staff_spell;
        delete obj.properties.minDamage;
        delete obj.properties.maxDamage;
        delete obj.properties.speed;
        delete obj.properties.weapon_message;
        delete obj.properties.can_wield;
        delete obj.properties.can_dwield;
        delete obj.properties.can_hold;
        delete obj.properties.armor_defense;
        delete obj.properties.container_max_weight;
        delete obj.properties.pickproof;
        delete obj.closeable;
        delete obj.closed;
        delete obj.locked;
        delete obj.lockedBy;
        delete obj.items;
        delete obj.properties.drink_container_max;
        delete obj.properties.drink_container_actual;
        delete obj.properties.drink_container_liquid;
        delete obj.properties.drink_container_venon;
        delete obj.properties.food_time;
        delete obj.properties.food_venon;
        delete obj.properties.currency;
        delete obj.properties.value;
        delete obj.properties.wing_time;
        delete obj.properties.corpse_from;
        delete obj.properties.portal_to;
      }

      say('');
      if (!obj.properties) {
        obj.properties = {};
      }
      switch (obj.type + '') {
        case 'LIGHT':
          say('')
          say('Número de horas/mud que a luz dura.');
          say('-1 = Luz infinita;');
          say(' 0 = Luz "gasta".');
          say(' x = Horas que a luz dura (max: 9999)');
          say('');
          write('Entre com a duração da luz: ');
          socket.once('data', val => {
            val = parseInt(val, 10);
            if (isNaN(val) || val < -1 || val > 9999) {
              say('<red>Duração inválida!</red>');
              return socket.emit('oedit-type-specifics', socket, obj, args);
            } else { 
              obj.properties.light_duration = val;
              args.question = 0;
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
          });
          break;
        case 'SCROLL':
        case 'POTION':
          if (question == 0) {
            say('')
            say('Nível das magias.');
            say('  0 - Mínimo');
            say('100 - Máximo');
            say('');
            write('Entre com o nível da magia: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 0 || val > 100) {
                say('<red>Nível da magia inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                const inType = obj.type.toLowerCase();
                obj.properties[inType + '_level'] = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1 || question == 2 || question == 3) {
            say('')
            say(`Escolha ${question == 1 ? 'primeira' : question == 2 ? 'segunda' : 'terceira'} magia (0 para Nonea)`);
            say(' Lista de magias');
            let i = 0;
            let spells = [];
            for (const [ id, skill ] of state.SpellManager.skills) {
              write(sprintf("%-20s", skill.id));
              spells.push(skill.id);
              if (++i % 3 === 0) {
                say('');
              }
            }
            say('');
            write('Entre com o nome da magia: ');
            socket.once('data', val => {
              val = val.toString().trim();
              const inType = obj.type.toLowerCase();
              if (!spells.includes(val) && val != '0') {
                say('<red>Magia inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else {
                if (val == '0') {
                  if (args.question == 1 ) {
                    say('<red>Ao menos 1 magia é obrigatória</red>');
                    return socket.emit('oedit-type-specifics', socket, obj, args);
                  }
                  if (question == 2) obj.properties[inType + '_spell_2'] = null;
                  obj.properties[inType + '_spell_3'] = null;
                  args.question = 0;
                  return socket.emit('oedit-main-menu', socket, obj, args);
                } else {
                  obj.properties[inType + '_spell_' + question] = val;
                  args.question++;
                  if (args.question > 3) {
                    args.question = 0;
                    return socket.emit('oedit-main-menu', socket, obj, args);
                  } else {
                    return socket.emit('oedit-type-specifics', socket, obj, args);
                  }
                }
              }
            });
          }
          break;
        case 'WAND':
        case 'STAFF':
          if (question == 0) {
            say('')
            say('Nível das magias.');
            say('  1 - Nível Mínimo');
            say('100 - Nível Máximo');
            say('');
            write('Entre com o nível da magia: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 1 || val > 100) {
                say('<red>Nível da magia inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.staff_level = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1 || question == 2) {
            say('')
            say(`Número ${question == 1 ? '<green>máximo</green>' : '<yellow>atual</yellow>'} de cargas.`);
            say('  0 - Mínimo');
            say('100 - Máximo');
            say('');
            write(`Entre com o número ${question == 1 ?  '<green>máximo</green>' : '<yellow>atual</yellow>'} de cargas: `);
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 0 || val > 100) {
                say('<red>Opção inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                if (question == 1) {
                  obj.properties.staff_max = val;
                } else {
                  if (val > obj.properties.staff_max) {
                    say('<red>E me diz como que vai ter mais cargas atuais que o máximo? Tá de brincadeira né.</red>');
                    return socket.emit('oedit-type-specifics', socket, obj, args);
                  }
                  obj.properties.staff_actual = val;
                }
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 3) {
            say('')
            say('Lista de magias:');
            let i = 0;
            let spells = [];
            for (const [ id, skill ] of state.SpellManager.skills) {
              write(sprintf("%-20s", skill.id));
              spells.push(skill.id);
              if (++i % 3 === 0) {
                say('');
              }
            }
            say('');
            write(`Escolha a magia : `);
            socket.once('data', val => {
              val = val.toString().trim();
              if (!spells.includes(val)) {
                say('<red>Magia inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else {
                  obj.properties.staff_spell = val;
                  args.question = 0;
                  return socket.emit('oedit-main-menu', socket, obj, args);
              }
            });
          }
          break;
        case 'WEAPON':
          if (question == 0) {
            say('')
            say('Número do primeiro lado do dado (X), quantidade de dados.');
            say('  1 - Número Mínimo');
            say('100 - Número Máximo');
            say('');
            write('Entre com o número de dados: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 1 || val > 100) {
                say('<red>Número inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.minDamage = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1) {
            say('')
            say('Tamanho (número de lados) do dado (Y).');
            say('  1 - Número Mínimo');
            say('100 - Número Máximo');
            say('');
            write('Entre com o número de lados do dados: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 1 || val > 100) {
                say('<red>Número inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.maxDamage = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 2) {
            say('')
            say('Número de segundos para dar um golpe com esta arma.');
            say('Exemplos:')
            say('0.8 - Extremamente rápida');
            say('2.8 - Velocidade normal');
            say('5 - Extremamente lento');
            say('');
            write('Entre com a velocidade: ');
            socket.once('data', val => {
              val = val.toString().replace(',', '.');
              val = parseFloat(val, 10);
              if (isNaN(val) || val <= 0 || val > 10) {
                say('<red>Número inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.speed = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          /*
          if (question == 3) {
            say('')
            say('Mensagem do dano da arma:');
            let weaponMsgs = [];
            let weaponKeys = [];
            let i = 0;
            for (let att in WeaponMessages) {
              weaponMsgs.push(WeaponMessages[att][0]);
              weaponKeys.push(att);
              write(sprintf("%-20s", WeaponMessages[att][0]));
              if (++i % 3 === 0) {
                say('');
              }
            } 
            say('');
            write('Entre com a mensagem: ');
            socket.once('data', val => {
              val = val.toString().trim();
              let idx = weaponMsgs.indexOf(val);
              if (idx < 0) {
                say('<red>Mensagem de dano inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else {
                  obj.properties.weapon_message = weaponKeys[idx];
                  args.question++;
                  return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          } */
          if (question == 4) {
            say('')
            write('Esta arma pode ser empunhada como primária (WIELD) ? [<b>s/N</b>] ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.can_wield = true;
              } else {
                obj.properties.can_wield = false;
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 5) {
            say('')
            write('Esta arma pode ser empunhada como secundária (DWIELD) ? [<b>s/N</b>] ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.can_dwield = true;
              } else {
                obj.properties.can_dwield = false;
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 6) {
            say('')
            write('Esta arma pode ser segurada (HOLD) ? [<b>s/N</b>] ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.can_hold = true;
              } else {
                obj.properties.can_hold = false;
              }
              args.question = 0;
              return socket.emit('oedit-main-menu', socket, obj, args);
            });
          }
          break;
        case 'ARMOR':
          say('')
          say('Este valor não corresponde ao total de defesa aplicada. Ele é calculado de acordo com o lugar do corpo onde o objeto é vestido. Se for vestido no corpo, a defesa é aumentada em 300% deste valor (triplo); na cabeça e nas pernas, a defesa é aumentada em 200% deste valor (dobro); e nas outras partes do corpo, a defesa é aumentada em 100% deste valor (uma vez apenas).');
          say('-=> Para entender melhor:');
          say('Cada parte do corpo precisa ser protegida, certo?  Mas algumas regiões do corpo possuem maior importância na sobrevivência da pessoa. Veja o caso da cabeça: é lá que se encontra o cérebro. E sem uma boa proteção, não há cérebro que resista.  O mesmo ocorre com o tronco, onde localizam-se órgãos como o coração, pulmões, estômago etc.  Assim, essas regiões precisam ser bem protegidas.  O mud, então, considera que os equipamentos dessas partes do corpo são de maior importância, e acaba multiplicando a defesa aplicado por números maiores. Se o equipamento for um elmo (cabeça), por exemplo, e for colocado no nesta propriedade o número 7, multiplica-se isso por dois (2*7)...  A defesa será, então, aumentada em 14 para quem o vestir.');
          say('');
          write('Entre com a defesa: ');
          socket.once('data', val => {
            val = parseInt(val, 10);
            if (isNaN(val) || val < -500 || val > 500) {
              say('<red>Defesa inválida!</red>');
              return socket.emit('oedit-type-specifics', socket, obj, args);
            } else { 
              obj.properties.armor_defense = val;
              args.question = 0;
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
          });
          break;
        case 'CONTAINER':
          if (question == 0) {
            say('')
            say('Peso máximo que pode conter, em gramas.');
            say('Exemplos:');
            say('    -1 - Infinito');
            say('  1000 - 1kg');
            say('100000 - 100kg');
            say('');
            write('Entre com a quantidade de gramas que o recipiente aguenta: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < -1 || val > 1000000) {
                say('<red>Número de gramas inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.container_max_weight = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1) {
            write('O recipiente possui tampa, e pode ser fechado ou trancado? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.closeable = true;
              } else {
                obj.closeable = false;
                obj.properties.pickproof = false;
                obj.closed = false;
                obj.locked = false;
                delete obj.lockedBy;
                args.question = 6;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 2) {
            write('A tranca do recipiente é a prova de ladrões? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.pickproof = true;
              } else {
                obj.properties.pickproof = false;
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 3) {
            write('O recipiente deverá estar <yellow>fechado</yellow> quando for carregado? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.closed = true;
              } else {
                obj.closed = false;
                obj.locked = false;
                args.question++;
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 4) {
            write('O recipiente deverá estar <red>trancado</red> quando for carregado? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.locked = true;
              } else {
                obj.locked = false;
                obj.lockedBy = '';
                args.question++;
              }
              args.question++;
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          if (question == 5) {
            say('Ao colocar aqui um ID inexistente, seu container <red>não vai funcionar</red>.')
            write('ID (area:numero, exemplo: limbo:10) da chave que abre o recipiente (-1 se não existir): ');
            socket.once('data', val => {
              val = val.toString().trim();
              if (val == '') {
                if (obj.locked) {
                  say('<red>Informação obrigatória para objetos trancados!</red>');
                  return socket.emit('oedit-type-specifics', socket, obj, args);
                } else {
                  delete obj.lockedBy;
                  args.question++;
                  return socket.emit('oedit-type-specifics', socket, obj, args);
                }
              } else {
                obj.lockedBy = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question > 5) {
            say('Este container conterá outros items? <red>Cuidado para não fazer referência circular</red>');
            say('Digite o ID do item e a chance de load (Se omitir a chance, vai ser 100%)');
            say('Exemplo: limbo:11 0,3 -> Carrega o item limbo:11 com 0,3% de chance ao resetar.')
            say('');

            write('Digite o ID e Chance (-1 para encerrar a lista): ');
            socket.once('data', val => {
              val = val.toString().trim();

              if (val == '-1') {
                args.question = 0;
                return socket.emit('oedit-main-menu', socket, obj, args);
              }

              const vals = val.split(' ');
              let chance = 100;
              if (vals[1]) {
                chance = vals[1].toString().replace(/,/g, '.');
              }
              chance = parseFloat(chance, 10);
              if (chance <= 0 || chance > 100 || isNaN(chance)) {
                chance = 100;
              }

              const checkitem = state.ItemFactory.getDefinition(vals[0]);
              if (checkitem) {
                let itemObj = {};
                itemObj[vals[0]] = chance;
                if (!obj.items) obj.items = [];
                obj.items.push(itemObj);
                say('Adicionando ' + JSON.stringify(itemObj));
                say('Itens atuais: ' + JSON.stringify(obj.items, null, '  '));
              } else {
                say('<red>Item inválido!</red>');
              }
              return socket.emit('oedit-type-specifics', socket, obj, args);
            });
          }
          break;
        case 'DRINKCON':
        case 'FOUNTAIN':
          if (question == 0) {
            say('')
            say('Digite a quantidade de goles que cabe no recipiente.')
            say('Exemplos:');
            say('   1 - Um copo de dose');
            say('  10 - Uma garrafa');
            say('  50 - Um Barril')
            say('9999 - Uma fonte quase inesgotável');
            say('');
            write('Quantidade de líquido que cabe no recipiente: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 0 || val > 10000) {
                say('<red>Quantidade inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.drink_container_max = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1) {
            say('')
            write('Quantidade de líquido atual no recipiente: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val > obj.properties.drink_container_max) {
                say('<red>Quantidade inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.drink_container_actual = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          } /*
          if (question == 2) {
            say('')
            say('Tipos de líquido:')
            let liquids = [];
            let i = 0;
            for (let liq in LiquidType) {
              liquids.push(liq);
              write(sprintf("  <b>%-11s</b> [ %-19s ]   ", liq, LiquidType[liq].name));
              if (++i % 2 === 0) {
                say('');
              }
            }
            say('');
            write('Entre com o líquido: ');
            socket.once('data', val => {
              val = val.toString().trim();
              let idx = liquids.indexOf(val);
              if (idx < 0) {
                say('<red>Líquido inválido!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else {
                  obj.properties.drink_container_liquid = val;
                  args.question++;
                  return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          } */
          if (question == 3) {
            write('O líquido está envenenado? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.drink_container_venon = true;
              } else {
                obj.properties.drink_container_venon = false;
              }
              args.question = 0;
              return socket.emit('oedit-main-menu', socket, obj, args);
            });
          }
          break;
        case 'FOOD':
          if (question == 0) {
            say('')
            say('Exemplos: pão de viagem = 24 horas, Pedaço de carne = 12 horas.')
            write('Quantidade de horas/mud que saciará a fome: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < -100 || val > 100) {
                say('<red>Quantidade inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.food_time = val;
                args.question++;
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
            });
          }
          if (question == 1) {
            write('A comida está envenenada? [<b>s/N</b>]: ');
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();

              if (!/[sn]/.test(val)) {
                say('<red>Resposta inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              }
              if (val === 's') {
                obj.properties.food_venon = true;
              } else {
                obj.properties.food_venon = false;
              }
              args.question = 0;
              return socket.emit('oedit-main-menu', socket, obj, args);
            });
          }
          break;
        case 'MONEY':
          if (question == 0) {
            say('Hoje somente temos implementado o tipo "gold", então selecionamos gold pra você.');
            obj.properties.currency = 'gold';
            say('')
            write('Quantidade de moedas: ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < 1 || val > 1000000000) {
                say('<red>Quantidade inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.value = val;
                args.question = 0;
                return socket.emit('oedit-main-menu', socket, obj, args);
              }
            });
          }
          break;
        case 'WINGS':
          if (question == 0) {
            say('')
            write('Número de horas/mud que a asa irá durar (-1 = infinito): ');
            socket.once('data', val => {
              val = parseInt(val, 10);
              if (isNaN(val) || val < -1 || val > 10000) {
                say('<red>Quantidade inválida!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else { 
                obj.properties.wing_time = val;
                args.question = 0;
                return socket.emit('oedit-main-menu', socket, obj, args);
              }
            });
          }
          break;
        case 'CORPSE':
          say(`<red>O tipo ${obj.type} não tem propriedades específicas.</red>`);
          obj.properties.corpse_from = 0;
          args.question = 0;
          return socket.emit('oedit-main-menu', socket, obj, args);
          break;
        case 'PORTAL':
          if (question == 0) {
            say('Ao colocar aqui um ID inexistente, <red>É óbvio que não vai funcionar</red>.')
            write('ID (area:id, exemplo: midgaard:1) da sala que o portal é ligado: ');
            socket.once('data', val => {
              val = val.toString().trim();
              if (val == '') {
                say('<red>Informação obrigatória para portais!</red>');
                return socket.emit('oedit-type-specifics', socket, obj, args);
              } else {
                obj.properties.portal_to = val;
                args.question = 0;
                return socket.emit('oedit-main-menu', socket, obj, args);
              }
            });
          }
          break;
        default:
          say(`<red>O tipo ${obj.type} não tem propriedades específicas.</red>`);
          args.question = 0;
          return socket.emit('oedit-main-menu', socket, obj, args);
      }
    }
  };
};
