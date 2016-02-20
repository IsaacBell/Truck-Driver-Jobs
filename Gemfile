source 'https://rubygems.org'
ruby '1.9.3'
gem 'rails', '3.2.16'

# For heroku
gem 'rails_12factor', group: :production

gem 'pg'
gem 'caboose-cms', '0.5.79'
#gem 'caboose-cms', :path => '/Users/william/Sites/gems/caboose-cms'
gem 'underscore-rails'
gem 'asset_sync'
gem 'unf'
gem 'awesome_print'
gem 'aws-sdk'
gem 'delayed_job_active_record'
gem 'unicorn'
gem 'feedjira'
gem 'geocoder'
gem 'ruby-prof'
gem 'yaml_db'
gem 'authorizenet'

group :assets do
  gem 'uglifier', '>= 1.0.3'
  gem 'sass-rails'
  gem 'compass-rails'
end

group :development, :test do
  gem 'rspec-rails'
  gem 'factory_girl_rails'
end

group :test do
  gem 'faker'
  gem 'capybara'
  gem 'guard-rspec'
  gem 'launchy'
end

group :production do
  gem 'newrelic_rpm'
end

