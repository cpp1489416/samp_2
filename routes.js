
const express = require('express')
const router = express.Router()
const ethCache = require('./eth_cache')
const multer = require('multer')
const OSS = require('ali-oss')
const eth_map = require('./eth_map')

const ali_oss_client = new OSS({
    region: 'oss-cn-hangzhou',
    //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
    accessKeyId: 'LTAIt6fW5nuXBNhP',
    accessKeySecret: 'KsZrdElriwrKX3LezTn098VBnKmwwQ',
    bucket: 'wilsonfile'
})

function calculate_md5(path) {
    return new Promise((resolve, reject) => {
        var fs = require('fs');
        var crypto = require('crypto');

        var start = new Date().getTime();
        var md5sum = crypto.createHash('md5');
        var stream = fs.createReadStream(path);
        stream.on('data', function(chunk) {
            md5sum.update(chunk);
        });
        stream.on('end', function() {
            str = md5sum.digest('hex').toUpperCase();
            console.log('文件:'+path+',MD5签名为:'+str+'.耗时:'+(new Date().getTime()-start)/1000.00+"秒");
            resolve(str)
        });
    })
}

router.post('/files', multer({
    dest: './upload/'
}).single('file'), async (req, res) => {
    console.log(req.file)
    const result = await ali_oss_client.put(req.file.originalname, './upload/' + req.file.filename)
    const md5 = await calculate_md5('./upload/' + req.file.filename);
    console.log(result)
    console.log(md5)
    await eth_map.put_md5(req.file.originalname, md5)
    return res.json({
        code: '0',
        msg: '',
        info: {
            'md5': md5
        }
    })
})

router.get('/files', async (req, res) => {
    let result = await ali_oss_client.list();
    console.log(result);
    // 根据nextMarker继续列出文件。
    if (result.isTruncated) {
      let result = await client.list({
        marker: result.nextMarker
      });
    }
    const lists = []
    for (let i in result.objects) {
        lists.push(result.objects[i].name)
    }
    return res.json({
        code: '0',
        msg: '',
        info: lists
    })
})

router.get('/files/check/:file_name', async (req, res) => {
    const path = './download/' + req.params.file_name
    const result = await ali_oss_client.get(req.params.file_name, path)
    console.log(result)

    console.log(await calculate_md5(path))
    res.json({
        code: '0',
        msg: '',
        info: await eth_map.match_file(req.params.file_name, await calculate_md5(path))
    })
})

router.get('/files/:file_name', async (req, res) => {
    res.download('./download/' + req.params.file_name)
})

router.get('/eth', (req, res) => {
    return res.json({
        code: '0',
        msg: '',
        info: {
            url: ethCache.url,
            token: ethCache.token
        }
    })
})

router.put('/eth', (req, res) => {
    ethCache.regenerateContract(req.body.url, req.body.token)
    return res.json({
        code: '0',
        msg: '',
        info: null
    })
})

router.get('/livingRoom', async (req, res, next) => {
    let historyCached = []
    try {
        historyString = await ethCache.get('get_living_room_history');
        historyCached = JSON.parse(historyString);
    } catch(e) {
    }
    return res.json({
        code: '0',
        msg: '',
        info: {
            airConditioner: {
                on: await ethCache.get('getMessageLivingRoomAirConditioner_S') === 'on',
                temperature: await ethCache.get('getMessageLivingRoomAirConditioner_T')
            },
            tv: {
                on: await ethCache.get('getMessageLivingRoomTV') === 'on'
            },
            light: {
                on: await ethCache.get('getMessageliving_room_light') === 'on'
            },
            history: historyCached
        }
    })
})

router.put('/livingRoom', async (req, res, next) => {
    await ethCache.set('setMessageLivingRoomAirConditioner_S', req.body.airConditioner.on ? 'on' : 'off')
    await ethCache.set('setMessageLivingRoomAirConditioner_T', req.body.airConditioner.temperature)
    await ethCache.set('setMessageLivingRoomTV', req.body.tv.on ? 'on' : 'off')
    await ethCache.set('setMessageliving_room_light', req.body.light.on ? 'on' : 'off')
    try {
        JSON.stringify(req.body.history)
    } catch(e) {
    }
    await ethCache.set('set_living_room_history', JSON.stringify(req.body.history))
    return res.json({
        code: '0',
        msg: '',
        info: null
    })
})

router.get('/kitchen', async (req, res, next) => {
    let historyCached = []
    try {
        historyString = await ethCache.get('get_kitchen_history');
        historyCached = JSON.parse(historyString);
    } catch(e) {
    }
    return res.json({
        code: '0',
        msg: '',
        info: {
            light: {
                on: await ethCache.get('getMessagekitchen_light') === 'on'
            },
            microwaveOven: {
                on: await ethCache.get('getMessagekitchen_Microwave_Oven') === 'on'
            },
            riceCooker: {
                on: await ethCache.get('getMessagekitchen_Rice_cooker') === 'on'
            },
            lampblackMachine: {
                on: await ethCache.get('getMessagekitchen_Lampblack_machine') === 'on'
            },
            history: historyCached
        }
    })
})

router.put('/kitchen', async(req, res) => {
    await ethCache.set('setMessagekitchen_light', req.body.light.on ? 'on': 'off')
    await ethCache.set('setMessagekitchen_Microwave_Oven', req.body.microwaveOven.on ? 'on': 'off')
    await ethCache.set('setMessagekitchen_Rice_cooker', req.body.riceCooker.on ? 'on': 'off')
    await ethCache.set('setMessagekitchen_Lampblack_machine', req.body.lampblackMachine.on ? 'on': 'off')
    await ethCache.set('set_kitchen_history', JSON.stringify(req.body.history))
    return res.json({
        code: '0',
        msg: '',
        info: null
    })
})

router.get('/room1', async (req, res) => {
    let historyCached = []
    try {
        historyString = await ethCache.get('get_room1_history');
        historyCached = JSON.parse(historyString);
    } catch(e) {
    }
    return res.json({
        code: '0',
        msg: '',
        info: {
            airConditioner: {
                on: await ethCache.get('getMessageroom1_Air_conditioner_S') === 'on',
                temperature: await ethCache.get('getMessageroom1_Air_conditioner_T')
            },
            light: {
                on: await ethCache.get('getMessageroom1_light') === 'on'
            },
            besideLamp: {
                on: await ethCache.get('getMessageroom1_Bedside_lamp') === 'on'
            },
            tv: {
                on: await ethCache.get('getMessageroom1_TV') === 'on'
            },
            history: historyCached
        }
    })
})

router.put('/room1', async (req, res) => {
    await ethCache.set('setMessageroom1AirConditioner_S', req.body.airConditioner.on ? 'on': 'off')
    await ethCache.set('setMessageroom1AirConditioner_T', req.body.airConditioner.temperature)
    await ethCache.set('setMessageroom1_ligth', req.body.light.on ? 'on': 'off')
    await ethCache.set('setMessageroom1_Bedside_lamp', req.body.besideLamp.on ? 'on': 'off')
    await ethCache.set('setMessageroom1_TV', req.body.tv.on ? 'on': 'off')
    await ethCache.set('set_room1_history', JSON.stringify(req.body.history))
    return res.json({
        code: '0',
        msg: '',
        info: null
    })

})

router.get('/room2', async (req, res) => {
    let historyCached = []
    try {
        historyString = await ethCache.get('get_room2_history');
        historyCached = JSON.parse(historyString);
    } catch(e) {
    }
    return res.json({
        code: '0',
        msg: '',
        info: {
            airConditioner: {
                on: await ethCache.get('getMessageroom2_Air_conditioner_S') === 'on',
                temperature: await ethCache.get('getMessageroom2_Air_conditioner_T')
            },
            light: {
                on: await ethCache.get('getMessageroom2_light') === 'on'
            },
            besideLamp: {
                on: await ethCache.get('getMessageroom2_Bedside_lamp') === 'on'
            },
            tv: {
                on: await ethCache.get('getMessageroom2_TV') === 'on'
            },
            history: historyCached
        }
    })
})

router.put('/room2', async (req, res) => {
    await ethCache.set('setMessageroom2AirConditioner_S', req.body.airConditioner.on ? 'on': 'off')
    await ethCache.set('setMessageroom2AirConditioner_T', req.body.airConditioner.temperature)
    await ethCache.set('setMessageroom2_light', req.body.light.on ? 'on': 'off')
    await ethCache.set('setMessageroom2_Bedside_lamp', req.body.besideLamp.on ? 'on': 'off')
    await ethCache.set('setMessageroom2_TV', req.body.tv.on ? 'on': 'off')
    await ethCache.set('set_room2_history', JSON.stringify(req.body.history))
    return res.json({
        code: '0',
        msg: '',
        info: null
    })

})


router.get('/restroom', async (req, res) => {
    let historyCached = []
    try {
        historyString = await ethCache.get('get_restroom_history');
        historyCached = JSON.parse(historyString);
    } catch(e) {
    }
    return res.json({
        code: '0',
        msg: '',
        info: {
            light: {
                on: await ethCache.get('getMessagerestroom_light') === 'on',
            },
            heater: {
                on: await ethCache.get('getMessagerestroom_Heater') === 'on'
            },
            heating: {
                on: await ethCache.get('getMessagerestroom_Heating') === 'on'
            },
            history: historyCached
        }
    })
})

router.put('/restroom', async (req, res) => {
    await ethCache.set('setMessagerestroom_light', req.body.light.on ? 'on': 'off')
    await ethCache.set('setMessagerestroom_Heater', req.body.heater.on ? 'on' : 'off')
    await ethCache.set('setMessagerestroom_Heating', req.body.heating.on ? 'on': 'off')
    await ethCache.set('set_restroom_history', JSON.stringify(req.body.history))
    return res.json({
        code: '0',
        msg: '',
        info: null
    })
})

module.exports = router