var gameList = [
    {
        'url': 'http://yx8.com/game/huabantiaoyue/',
        'title': '滑板跳跃',
        'desc': '轻碰或长按屏幕，控制滑板手跳跃躲过障碍，挑战纪录'
    },
    {
        'url': 'http://yx8.com/game/yingxiongtanxian/',
        'title': '英雄探险',
        'desc': '触碰屏幕，开始冒险之旅'
    },
    {
        'url': 'http://yx8.com/game/diefangkuai/',
        'title': '叠方块',
        'desc': '触摸空白处，使周围的方块叠起来，最终把所有方块叠在一起，所有方块叠在星星处得到星星奖励'
    },
    {
        'url': 'http://yx8.com/game/wanjutafang/',
        'title': '玩具塔防',
        'desc': `小男孩放假在家里挺无聊的，他布置玩具士兵开始了塔防游戏
                        拖动士兵布置在地图上，然后按右上播放或快进图标开始游戏`
    },
    {
        'url': 'http://yx8.com/game/shayufeixiang/',
        'title': '鲨鱼飞翔',
        'desc': '鲨鱼也有春天，拉伸发射鲨鱼，收集所有的三叶草，躲开乌龟'
    },
    {
        'url': 'http://yx8.com/game/guaiwulieren/',
        'title': '怪物猎人',
        'desc': '帮助猎人守卫城堡，消灭来犯的怪物'
    },
    {
        'url': 'http://yx8.com/game/hejindongwu/',
        'title': '合金动物',
        'desc': '类似激突要塞的游戏，善良的动物们武装起来，向怪兽们发起冲击！'
    },
    {
        'url': 'http://yx8.com/game/jianfengchazhen/',
        'title': '见缝插针',
        'desc': '一款虐手兼虐心的弱智力型小游戏，你要将若干个针球投射到画面中央不停旋转的大球上，同时不能让小球彼此产生接触。随着关卡难度会变得很高，这是对节奏感与眼力的一种严格考验。'
    },
    {
        'url': 'http://yx8.com/game/shibingtuji/',
        'title': '士兵突击',
        'desc': '单枪匹马深入敌营浴血奋战'
    },
    {
        'url': 'http://yx8.com/game/jisuqianshuiting/',
        'title': '急速潜水艇',
        'desc': '驾驶潜水艇在海底探险，收集金币和奖励，躲开障碍和攻击，触碰上升'
    },
    {
        'url': 'http://yx8.com/game/yingyongqishi/',
        'title': '英勇骑士',
        'desc': '勇士救公主，先收集金币，触摸改变方向'
    },
    {
        'url': 'http://yx8.com/game/secaidabaozha/',
        'title': '色彩大爆炸',
        'desc': '选择上方彩色炮弹，消灭同色炸弹'
    },
    {
        'url': 'http://yx8.com/game/xiaodongwulianliankan/',
        'title': '小动物连连看',
        'desc': '触摸消除相同的小动物'
    }
];

function getRandomGame(){
    var index = Math.floor(Math.random()*gameList.length);
    return gameList[index];
}

module.exports ={
    gameList: gameList,
    getRandomGame: getRandomGame
};
