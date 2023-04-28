const { sendEmailSchema } = require("./schemas/email.schema");

async function saveHashMongo(email, hash, type) {
  const existeEmail = await sendEmailSchema.findOne({ email: email });
  if (existeEmail) {
    data_atual = new Date();
    return await sendEmailSchema.updateOne(
      { _id: existeEmail._id },
      {
        hash: hash,
        type: type,
        created_at: data_atual,
      }
    );
  }
  if (!existeEmail) {
    data_atual = new Date();

    return await sendEmailSchema({
      email: email,
      hash: hash,
      type: type,
      created_at: data_atual,
    }).save();
  }
}

async function deleteHashMongo(email) {
  const res_delete = await sendEmailSchema.find({
    email: email,
  });
  if (res_delete) {
    if (res_delete.length == 0) return false;
    return await sendEmailSchema
      .deleteOne({ _id: res_delete[0]._id })
      .then(() => {
        return true;
      });
  } else {
    return false;
  }
}

async function findHashMongo(email, hash) {
  const exists = await sendEmailSchema.findOne({
    email: email,
    hash: hash,
  });

  if (!exists) {
    return false;
  }
  return true;
}

module.exports = {
  saveHashMongo,
  deleteHashMongo,
  findHashMongo,
};
