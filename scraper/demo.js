// Demo data generator for testing the UI without LinkedIn credentials

const DEMO_PROFILES = {
  'project-manager': [
    { name: 'Sarah Johnson', title: 'Senior Project Manager', company: 'TechCorp Solutions', email: 'sarah.j@techcorp.com', phone: '+1 (555) 234-5678', location: 'San Francisco, CA', profileUrl: 'https://linkedin.com/in/sarah-johnson-pm' },
    { name: 'Michael Chen', title: 'Project Manager', company: 'Agile Innovations', email: 'm.chen@agile.io', phone: '+1 (555) 345-6789', location: 'New York, NY', profileUrl: 'https://linkedin.com/in/michael-chen-pm' },
    { name: 'Emma Williams', title: 'IT Project Manager', company: 'CloudBase Inc.', email: 'e.williams@cloudbase.com', phone: '+44 20 7946 0958', location: 'London, UK', profileUrl: 'https://linkedin.com/in/emma-williams' },
    { name: 'James Rodriguez', title: 'Program Manager', company: 'DataDrive Corp', email: 'jrodriguez@datadrive.com', phone: '+1 (555) 456-7890', location: 'Austin, TX', profileUrl: 'https://linkedin.com/in/james-rodriguez' },
    { name: 'Priya Patel', title: 'Scrum Master & PM', company: 'SprintWorks', email: 'priya@sprintworks.dev', phone: '+91 98765 43210', location: 'Bangalore, India', profileUrl: 'https://linkedin.com/in/priya-patel-pm' }
  ],
  'tech-manager': [
    { name: 'David Kim', title: 'VP of Engineering', company: 'NovaTech Labs', email: 'david.kim@novatech.com', phone: '+1 (555) 567-8901', location: 'Seattle, WA', profileUrl: 'https://linkedin.com/in/david-kim-eng' },
    { name: 'Lisa Thompson', title: 'Engineering Manager', company: 'ByteForge', email: 'l.thompson@byteforge.io', phone: '+1 (555) 678-9012', location: 'Chicago, IL', profileUrl: 'https://linkedin.com/in/lisa-thompson-tech' },
    { name: 'Robert Martinez', title: 'Technical Lead Manager', company: 'CodeStream Systems', email: 'rmartinez@codestream.com', phone: '+34 91 123 4567', location: 'Madrid, Spain', profileUrl: 'https://linkedin.com/in/robert-martinez-tech' },
    { name: 'Anna Kowalski', title: 'Head of Technology', company: 'Horizon Software', email: 'anna.k@horizonsw.com', phone: '+48 22 123 4567', location: 'Warsaw, Poland', profileUrl: 'https://linkedin.com/in/anna-kowalski' },
    { name: 'Jason Lee', title: 'Director of Engineering', company: 'PivotPoint Tech', email: 'jlee@pivotpoint.com', phone: '+1 (555) 789-0123', location: 'Boston, MA', profileUrl: 'https://linkedin.com/in/jason-lee-eng' }
  ],
  'ceo': [
    { name: 'Alexandra Foster', title: 'CEO & Co-Founder', company: 'FutureCraft AI', email: 'alex@futurecraft.ai', phone: '+1 (555) 890-1234', location: 'San Jose, CA', profileUrl: 'https://linkedin.com/in/alexandra-foster' },
    { name: 'Thomas Weber', title: 'Chief Executive Officer', company: 'Pinnacle Ventures', email: 't.weber@pinnacle.vc', phone: '+49 30 12345678', location: 'Berlin, Germany', profileUrl: 'https://linkedin.com/in/thomas-weber-ceo' },
    { name: 'Olivia Bennett', title: 'CEO', company: 'GreenScale Solutions', email: 'olivia@greenscale.co', phone: '+1 (555) 901-2345', location: 'Denver, CO', profileUrl: 'https://linkedin.com/in/olivia-bennett' },
    { name: 'Raj Mehta', title: 'CEO & Founder', company: 'InnoVenture Labs', email: 'raj@innoventure.in', phone: '+91 99887 76655', location: 'Mumbai, India', profileUrl: 'https://linkedin.com/in/raj-mehta-ceo' },
    { name: 'Carlos Sanchez', title: 'Chief Executive', company: 'TechBridge Global', email: 'c.sanchez@techbridge.com', phone: '+1 (555) 012-3456', location: 'Miami, FL', profileUrl: 'https://linkedin.com/in/carlos-sanchez-ceo' }
  ],
  'cto': [
    { name: 'Nathan Powell', title: 'CTO & Co-Founder', company: 'DeepLogic AI', email: 'nathan@deeplogic.ai', phone: '+1 (555) 123-4567', location: 'Palo Alto, CA', profileUrl: 'https://linkedin.com/in/nathan-powell-cto' },
    { name: 'Sophia Muller', title: 'Chief Technology Officer', company: 'CipherNet Security', email: 's.muller@ciphernet.de', phone: '+49 89 98765432', location: 'Munich, Germany', profileUrl: 'https://linkedin.com/in/sophia-muller' },
    { name: 'Kevin Nguyen', title: 'CTO', company: 'ScaleOps Platform', email: 'kevin@scaleops.io', phone: '+1 (555) 234-5678', location: 'Portland, OR', profileUrl: 'https://linkedin.com/in/kevin-nguyen-cto' },
    { name: 'Isabella Romano', title: 'VP Technology / CTO', company: 'Nexus Platforms', email: 'isabella@nexusplt.com', phone: '+39 02 12345678', location: 'Milan, Italy', profileUrl: 'https://linkedin.com/in/isabella-romano' },
    { name: 'Marcus Hill', title: 'Chief Technical Officer', company: 'CloudNative Inc.', email: 'm.hill@cloudnative.com', phone: '+1 (555) 345-6789', location: 'Atlanta, GA', profileUrl: 'https://linkedin.com/in/marcus-hill-cto' }
  ],
  'agency-freelancer': [
    { name: 'Zoe Carter', title: 'Agency Owner / Full-Stack Developer', company: 'Carter Digital Agency', email: 'zoe@carterdigital.co', phone: '+44 7700 900123', location: 'Manchester, UK', profileUrl: 'https://linkedin.com/in/zoe-carter-dev' },
    { name: 'Liam O\'Brien', title: 'Freelance Tech Consultant', company: 'Self-Employed', email: 'liam@obrienconsult.com', phone: '+353 1 234 5678', location: 'Dublin, Ireland', profileUrl: 'https://linkedin.com/in/liam-obrien' },
    { name: 'Nina Yamamoto', title: 'Creative Agency Director', company: 'Studio Yama', email: 'nina@studioyama.jp', phone: '+81 3 1234 5678', location: 'Tokyo, Japan', profileUrl: 'https://linkedin.com/in/nina-yamamoto' },
    { name: 'Diego Vargas', title: 'Freelance Project Lead', company: 'Vargas Tech Solutions', email: 'diego@vargastech.mx', phone: '+52 55 1234 5678', location: 'Mexico City, Mexico', profileUrl: 'https://linkedin.com/in/diego-vargas' },
    { name: 'Amelia Turner', title: 'Agency Founder & Strategist', company: 'Turner Growth Agency', email: 'amelia@turnergrowth.com', phone: '+1 (555) 456-7890', location: 'Nashville, TN', profileUrl: 'https://linkedin.com/in/amelia-turner' }
  ]
};

function generateDemoData(roles, location = '') {
  const results = [];

  for (const role of roles) {
    const profiles = DEMO_PROFILES[role] || [];
    for (const profile of profiles) {
      results.push({
        ...profile,
        searchRole: role,
        location: location ? `${location}` : profile.location,
        scrapedAt: new Date().toISOString()
      });
    }
  }

  return results;
}

module.exports = { generateDemoData };
