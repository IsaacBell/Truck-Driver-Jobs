require 'httparty'

namespace :hdn do
  
  desc "Ping the sitemap"
  task :ping_sitemap => :environment do
    sitemap = "http://www.truckdriverjobs.com/sitemap.xml"
    HTTParty.get("http://www.google.com/webmasters/tools/ping?sitemap=#{sitemap}")
    HTTParty.get("http://search.yahooapis.com/SiteExplorerService/V1/ping?sitemap=#{sitemap}")
    HTTParty.get("http://www.bing.com/ping?sitemap=#{sitemap}")
    HTTParty.get("http://submissions.ask.com/ping?sitemap=#{sitemap}")
  end
  
  desc "Add IP to EC2 security group"
  task :add_ip => :environment do
    Ec2Bouncer.allow('162.17.70.66')
    #Ec2Bouncer.clear_all
  end
  
  desc "Test sendgrid"
  task :test_sendgrid => :environment do
    
    #email = MailoutEmail.new    
    #resp = email.send('william@nine.is', "Test #{DateTime.now.strftime('%F %T')}", "Just a test", 123456)
    #puts resp.inspect
            
    log = MailoutLog.create(
      :batch_id         => 1000,
      :mailout_id       => 1,        
      :date_sent        => DateTime.now,
      :applicant_count  => 1,
      :body             => "Just a test",
      :scheduled        => false,
      :user_id          => 1,
      :response         => nil 
    )        
    email = MailoutEmail.new
    resp = email.send('william@nine.is', "Test #{DateTime.now.strftime('%F %T')}", "Just a test", log.id)    
    log.success = true    
    log.response = Caboose.json({
      :code => resp.code,
      :headers => resp.headers,
      :body => resp.body
    })
    log.save
    puts "http://localhost:3000/logs/1000/#{log.id}"    
    
  end
  
  desc "Create batches for logs"
  task :create_batches => :environment do
    
    ids = MailoutLog.where("batch_id not in (select id from batches)").reorder(:batch_id).pluck(:batch_id)
    ids.uniq!
    count = ids.count
    i = 1
    ids.each do |batch_id|
      next if batch_id.nil?      
      puts "Creating batch for #{batch_id} (#{i} of #{count})..."
      i = i + 1
      
      mailout_id       = MailoutLog.where(:batch_id => batch_id).first.mailout_id
      applicant_count  = MailoutLog.where(:batch_id => batch_id).sum(:applicant_count)
      page_count       = MailoutLog.where(:batch_id => batch_id).count
      count_successful = MailoutLog.where(:batch_id => batch_id, :success => true).sum(:applicant_count)
      count_failed     = MailoutLog.where(:batch_id => batch_id, :success => true).sum(:applicant_count)
      date_started     = MailoutLog.where(:batch_id => batch_id).minimum(:date_sent)
      date_completed   = MailoutLog.where(:batch_id => batch_id).maximum(:date_sent)

      Batch.create({
        :id                  => batch_id,
        :mailout_id          => mailout_id,
        :applicant_count     => applicant_count,
        :page_count          => page_count,
        :count_successful    => count_successful,
        :count_failed        => count_failed,
        :date_started        => date_started,
        :date_completed      => date_completed,
        :percentage_complete => 1.00,
        :status              => Batch::STATUS_COMPLETE
      })
    end          
  end
  
  desc "Initializes the hiring drivers now database"
  task :db => :environment do
    Schema.create_schema
    Schema.load_data
  end

  desc "Send mailouts"
  task :send_mailouts => :environment do
    puts "Starting process..."
    Mailout.process_all           
    puts "Done."
  end
  
  desc "WS Test"
  task :ws_test => :environment do
    h = {
      "title"=>"Hiring Truckers Now App",
      "_wpcf7"=>"8",
      "_wpcf7_version"=>"3.4",
      "_wpcf7_unit_tag"=>"wpcf7-f8-t1-o1",
      "_wpnonce"=>"30cce50950",
      "first-name"=>"david",
      "last-name"=>"howard",
      "applicant-email"=>"r4s8j@yahoo.com",
      "phone"=>"9403252375",
      "city"=>"mineral wells",
      "state"=>"TX",
      "zip"=>"76067",
      "YrsofExp"=>"5+ yrs",
      "graduate"=>"No",
      "employed"=>"No",
      "license"=>"Class A",
      "type"=>"Company Driver",
      "distance"=>"Local|Dedicated|Regional|OTR (Over-the-Road)",
      "haul"=>"Flatbed",
      "MV"=>"0",
      "PA"=>"0",
      "DUI"=>"No",
      "_wpcf7_is_ajax_call"=>"1",
      "controller"=>"applicants",
      "action"=>"add_from_wordpress"
    }
    puts "------------------------------------------"
    puts h.to_s
    puts "------------------------------------------"
    puts h.to_json
    puts "------------------------------------------"
  end
  
end
