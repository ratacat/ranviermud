// These numbers are arbitrary.
// Lower = more rare, higher = more common.
// You could use any scale you want, these numbers could be
// 10, 50, 100. Feel free to get more granular.
const COMMON = 10
const UNCOMMON = 3
const RARE = 1

module.exports = {
  meadow: {
    weight: UNCOMMON,
    title: 'A forest meadow',
    description: 'The sunlight filters through the leaves, dappling the soft grass beneath your feet with an ever shifting pattern that tickles your eyes.'
  },

  forest: {
    weight: COMMON,
    title: 'A dense forest',
    description: 'The leaves are everywhere. Some the size of your face, you can barely see what you are walking on due to all the dripping wet plants.'
  },

  nest: {
    weight: RARE,
    title: 'A nesting place',
    description: 'Some large animals must have recently been sleeping here, all of the grasses are crushed into the ground.'
  }
};