/**
 * Created by jarvis on 7/9/15.
 */
var video = [
    {
        '_id': 'XNjc4NDgzMjMy',
        'title': 'Monsieur COK',
        'description': `Cok先生是一家军火工厂的老板，为了不断的追求利润最大化，将人类员工全部用机器人代替，这些失业的人们无法忍受这个充满了机器的社会，但是最终又会怎样呢？
在2009年的电影节惊鸿一现之后，插画家Franck Dion于7年后放出了这部片子的完整版，写实而又平面的画风，加上诡异的气氛与充满了讽刺和隐喻的画面，让这部充满了蒸汽朋克的动画看点十足。`
    },
    {
        '_id': 'XNjY1OTg0ODY4',
        'title': 'Transmission',
        'description': `一辆运送外星人的货车翻到在山洞门前，外面寂静无声，外星人从车厢里面出来，却发现没有一个活着的人类，究竟人类去了哪里？他能否循着空气中的广播找到其他的生命体呢？
影片采用全flash制作，耗时六个月，导演Jared D.Weiss试图通过这部片子，展现出一个荒芜的世界中的希望。`
    },
    {
        '_id': 'XNjc1NTcyMTgw',
        'title': 'Silent',
        'description': `来自杜比和之前荣获奥斯卡最佳动画短片奖的Moonbot的一部小短片，讲述了声音和画面的融合，对于电影行业产生的巨大推动作用。

影片的主角依旧是《莫里斯先生和他的神奇飞书》的主角莫里斯先生，加上一个可爱的小女孩，在声音变换的世界中穿行冒险。

影片致敬的不仅仅是声音与画面的关系，更是科学和艺术的关系。`
    }
];

function getRandomVideo(){
    var index = Math.floor(Math.random()*video.length);
    return video[index];
}

module.exports ={
    videoList: video,
    getRandomVideo: getRandomVideo
};