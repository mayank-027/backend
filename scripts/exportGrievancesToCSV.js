const mongoose = require('mongoose');
const fs = require('fs');
const { Parser } = require('json2csv');
const Grievance = require('../models/Grievance');

const MONGODB_URI =  'mongodb+srv://parasstarkmarkup:DKvIzrVeJgR1nrwX@cluster0.cr8izeq.mongodb.net/authdb?retryWrites=true&w=majority';

async function exportGrievances() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const grievances = await Grievance.find({}, 'title description category priority status').lean();

  const fields = ['title', 'description', 'category', 'priority', 'status'];
  const parser = new Parser({ fields });
  const csv = parser.parse(grievances);

  fs.writeFileSync('grievances.csv', csv);
  console.log('Exported grievances to grievances.csv');
  mongoose.disconnect();
}

exportGrievances(); 