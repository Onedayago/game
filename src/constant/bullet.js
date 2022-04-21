

//子弹一
const BULLET_ONE = {
    x: 0,
    y: 0,
    src: './assets/bullet/bulletOne.png',
    width: 10,
    height: 30,
}

//子弹一级数一
const BULLET_ONE_LEVEL_1 = {
    ...BULLET_ONE,
    speed: 2,
    maxBullet: 3, //最大子弹数量
    attackBlood: 1, //子弹攻击的威力
}

//子弹一级数二
const BULLET_ONE_LEVEL_2 = {
    ...BULLET_ONE,
    speed: 3,
    maxBullet: 4, //最大子弹数量
    attackBlood: 2, //子弹攻击的威力
}

//子弹一级数三
const BULLET_ONE_LEVEL_3 = {
    ...BULLET_ONE,
    speed: 4,
    maxBullet: 5, //最大子弹数量
    attackBlood: 3, //子弹攻击的威力
}

//子弹二
const BULLET_TWO = {
    x: 0,
    y: 0,
    src: './assets/bullet/bulletTwo.png',
    width: 30,
    height: 60,
}

//子弹二级数一
const BULLET_TWO_LEVEL_1 = {
    ...BULLET_TWO,
    speed: 3,
    maxBullet: 3, //最大子弹数量
    attackBlood: 3, //子弹攻击的威力
}

//子弹二级数二
const BULLET_TWO_LEVEL_2 = {
    ...BULLET_TWO,
    speed: 4,
    maxBullet: 4, //最大子弹数量
    attackBlood: 4, //子弹攻击的威力
}

//子弹二级数三
const BULLET_TWO_LEVEL_3 = {
    ...BULLET_TWO,
    speed: 5,
    maxBullet: 5, //最大子弹数量
    attackBlood: 5, //子弹攻击的威力
}

//子弹三
const BULLET_THREE = {
    x: 0,
    y: 0,
    src: './assets/bullet/bulletThree.png',
    width: 30,
    height: 60,
}

//子弹三级数一
const BULLET_THREE_LEVEL_1 = {
    ...BULLET_THREE,
    speed: 3,
    maxBullet: 3, //最大子弹数量
    attackBlood: 3, //子弹攻击的威力
}

//子弹三级数二
const BULLET_THREE_LEVEL_2 = {
    ...BULLET_THREE,
    speed: 4,
    maxBullet: 4, //最大子弹数量
    attackBlood: 4, //子弹攻击的威力
}

//子弹三级数三
const BULLET_THREE_LEVEL_3 = {
    ...BULLET_THREE,
    speed: 5,
    maxBullet: 5, //最大子弹数量
    attackBlood: 5, //子弹攻击的威力
}

export {
    BULLET_ONE,
    BULLET_ONE_LEVEL_1,
    BULLET_ONE_LEVEL_2,
    BULLET_ONE_LEVEL_3,
    BULLET_TWO,
    BULLET_TWO_LEVEL_1,
    BULLET_TWO_LEVEL_2,
    BULLET_TWO_LEVEL_3,
    BULLET_THREE,
    BULLET_THREE_LEVEL_1,
    BULLET_THREE_LEVEL_2,
    BULLET_THREE_LEVEL_3
}
