const Mock = require('mockjs');

if (process.env.VUE_APP_MOCK == 'true') {
  Mock.mock('/example', 'get', function () {
    var json = {
      id: '@id()',
      username: '@cname()',
      date: '@date()',
      avatar: "@image('200x200','red','#fff','avatar')",
      description: '@paragraph()',
      ip: '@ip()', //IP地址
      email: '@email()',
    };
    return json;
  });
}
