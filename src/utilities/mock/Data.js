export default {
  example: {
    id: '@id()',
    username: '@cname()',
    date: '@date()',
    avatar: "@image('200x200','red','#fff','avatar')",
    description: '@paragraph()',
    ip: '@ip()', //IP地址
    email: '@email()',
  },
  FanInfo: {
    '@odata.id': '后端指定',
    '@odata.type': '后端指定',
    Name: '后端指定',
    Description: '后端指定',
    AllInfo: [
      {
        Zone: 1,
        CurrentMode: 'Normal',
        fanInfo: [
          {
            Id: 1,
            SerialNumber: '43244dfa',
            Pwm: 99,
            FanSpeed: 100,
          },
          {
            Id: 2,
            SerialNumber: '43434tha',
            Pwm: 93,
            FanSpeed: 96,
          },
        ],
      },
      {
        Zone: 2,
        CurrentMode: 'Normal',
        fanInfo: [
          {
            Id: 3,
            SerialNumber: '43244dfa',
            Pwm: 99,
            FanSpeed: 100,
          },
          {
            Id: 4,
            SerialNumber: '43434tha',
            Pwm: 93,
            FanSpeed: 96,
          },
        ],
      },
    ],
    Count: 4,
  },
};
