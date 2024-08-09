const { User, Tracker, Analytics } = require('../models');
const { format } = require('date-fns');

const defaultSymptoms = {
  'Pain': [
    { name: 'Pelvic Pain', checked: false, severity: 0 },
    { name: 'GI Pain', checked: false, severity: 0 },
    { name: 'Leg Pain', checked: false, severity: 0 },
    { name: 'Back Pain', checked: false, severity: 0 },
    { name: 'Chest Pain', checked: false, severity: 0 },
    { name: 'Knee Pain', checked: false, severity: 0 },
    { name: 'Breast Pain', checked: false, severity: 0 },
    { name: 'Back Tenderness', checked: false, severity: 0 },
    { name: 'Cramping', checked: false, severity: 0 }

    
  ],
  'Neurological': [
    { name: 'Mirgrane', checked: false, severity: 0 },
    { name: 'Dizziness', checked: false, severity: 0 },
    { name: 'Inability to Concentrate', checked: false, severity: 0 },
    { name: 'Lightheadedness', checked: false, severity: 0 },
    { name: 'Chest Pain', checked: false, severity: 0 },
    { name: 'Knee Pain', checked: false, severity: 0 },
    { name: 'Breast Pain', checked: false, severity: 0 },
    { name: 'Back Tenderness', checked: false, severity: 0 },
    { name: 'Cramping', checked: false, severity: 0 }
    
  ],
  'Medication': [
    { name: 'Prescription Pain Meds', checked: false, note: 0 },
    { name: 'Birth Control', checked: false, note: 0 },
    { name: 'Naproxen', checked: false, note: 0 },
    { name: 'Lupron/GnRH Agonist', checked: false, note: 0 }
  ],
  'Digestive': [
    { name: 'Nausea', checked: false, severity: 0 },
    { name: 'Dizziness', checked: false, severity: 0 },
    { name: 'Bloating/Swelling', checked: false, severity: 0 },
    { name: 'loss of Appetite', checked: false, severity: 0 },
    { name: 'Constipation', checked: false, severity: 0 },
    { name: 'Diarrhea', checked: false, severity: 0 }

  ]
  ,
  'Sleep': [
    { name: 'Insomnia', checked: false, severity: 0 },
    { name: 'recurrent waking', checked: false, severity: 0 },
    { name: 'How well did you sleep last night?', severity: 0 },
    
  ]
  ,
  'General': [
    { name: 'Fatigue', checked: false, severity: 0 },
    { name: 'Breathlessness', checked: false, severity: 0 },
    { name: 'Missing School/Work', checked: false},
  
  ],
  'Mood': [
    { name: 'Depression', checked: false, severity: 0 },
    { name: 'Mood Swings', checked: false, severity: 0 },
    { name: 'Anxiety', checked: false, severity: 0},
  
  ],
  'Periods':[
    { name: 'I have my period', checked: false, severity: 0 }
  ]
  ,
  'User Notes':[
    { note:'' }
  ]
};



const login = async (req, res) => {
  const { code  } = req.body;

  try {
    let user = await User.findOne({ code });
    if (!user) {
      user = new User({ code });
      await user.save();
    }

        let tracker = await Tracker.findOne({ userId: user._id });

   
    if (!tracker) {
      tracker = new Tracker({
        data: defaultSymptoms,
        userId: user._id
      });
      await tracker.save();
    }

    res.status(200).json({
      message: 'Login successful',
      trackerData: tracker.data,
      trackerCode : code
    });
  } catch (err) {
    res.status(500).send('Error logging in');
  }
};



const submitTracker = async (req, res) => {
  const { date, data, code } = req.body;

  // console.log('Request received with data:', req.body);

  try {
    const user = await User.findOne({ code });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const formattedDate = format(date, 'yyyy-MM-dd');

    let tracker = await Tracker.findOne({ userId: user._id ,date: formattedDate });
    console.log('tracker',  formattedDate)

    if (tracker) {
   
      tracker.data = data;
      await tracker.save();
      res.status(200).send('Tracker data updated');
    } else {

      let curDate = new Date()
      const currentDate = format(curDate , 'yyyy-MM-dd')
      const givenDate = format(date , 'yyyy-MM-dd')
  

      tracker = new Tracker({
        date: givenDate|| currentDate,
        data,
        userId: user._id,
      });
      await tracker.save();
      res.status(201).send('Tracker data saved');
    }
  } catch (err) {
    res.status(500).send(`Error saving tracker data ${err}`);
  }
};




const getAnalytics = async (req, res) => {
  const { type, period, code } = req.query;

  console.log('here', type, period, code);

  try {
    const user = await User.findOne({ code });
    if (!user) {
      return res.status(400).send('User not found');
    }

    let match;
    if (type === 'monthly') {
      match = {
        userId: user._id,
        date: {
          $gte: new Date(`${period}-01T00:00:00.000+00:00`),
          $lt: new Date(`${period}-31T23:59:59.999+00:00`)
        },
      };
    } else if (type === 'yearly') {
      match = {
        userId: user._id,
        date: {
          $gte: new Date(`${period}-01-01T00:00:00.000+00:00`),
          $lt: new Date(`${parseInt(period) + 1}-01-01T00:00:00.000+00:00`)
        },
      };
    }

    const trackers = await Tracker.find(match).sort('date');

    if (type === 'monthly') {
      const result = {
        'Week 1': { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        'Week 2': { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        'Week 3': { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        'Week 4': { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
      };

      trackers.forEach(tracker => {
        const data = tracker.data || {};
        const week = `Week ${Math.ceil(new Date(tracker.date).getDate() / 7)}`;

        Object.keys(data).forEach(category => {
          if (result[week].hasOwnProperty(category)) {
            data[category].forEach(item => {
              if (item.checked) {
                result[week][category] += 1;
              }
            });
          }
        });
      });

      const formattedResult = Object.keys(result).map(week => ({
        week,
        ...result[week]
      }));

      res.status(200).json(formattedResult);

    } else if (type === 'yearly') {
      const result = {
        January: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        February: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        March: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        April: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        May: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        June: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        July: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        August: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        September: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        October: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        November: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
        December: { Pain: 0, Medication: 0, Digestive: 0, Terminal: 0 },
      };

      trackers.forEach(tracker => {
        const data = tracker.data || {};
        const month = new Date(tracker.date).toLocaleString('default', { month: 'long' });

        Object.keys(data).forEach(category => {
          if (result[month].hasOwnProperty(category)) {
            data[category].forEach(item => {
              if (item.checked) {
                result[month][category] += 1;
              }
            });
          }
        });
      });

      const formattedResult = Object.keys(result).map(month => ({
        month,
        ...result[month]
      }));

      res.status(200).json(formattedResult);
    }
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).send('Error fetching analytics data');
  }
};






module.exports = { login, submitTracker, getAnalytics };
