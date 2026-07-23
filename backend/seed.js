const bcrypt = require('bcryptjs');

async function test() {
  const isMatch = await bcrypt.compare('AdminPassword123!', '$2a$10$XH6ZBvu.uqa2Vn1W9kdTA.m7r6mpktbgXy9sonxKvZDVK8sAPxqv2');
  console.log("Does it match?", isMatch);
}
test();
