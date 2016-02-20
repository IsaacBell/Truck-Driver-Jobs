
function to_date_string(x)
{
  if (!x) return '';
  x = new Date(x);
  var y = x.getFullYear();
  var m = x.getMonth() + 1;
  var d = x.getDate();      
  var str = y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;     
  return str;
}

function to_time_string(x)
{    
  if (!x) return '';
  x = new Date(x);
  var h = x.getHours();
  var i = x.getMinutes();
  var p = 'am';
  if (h >= 12) { p = 'pm'; h -= 12 }
  if (h == 0) h = 12;    
  var str = '' + (h < 10 ? '0' : '') + h + ':' + (i < 10 ? '0' : '') + i + ' ' + p;
  return str;
}

function to_datetime_string(x)
{
  if (!x) return ''; 
  return to_date_string(x) + ' ' + to_time_string(x);
}

function strip_html(html)
{
  var tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

//==============================================================================

var JobsController = function(params) { this.init(params); }
JobsController.prototype = {
  
  //============================================================================
  // Required parameters 
  company_id: false,
  form_authenticity_token: false,
  //============================================================================

  init: function(params) {
    for (var thing in params)
      this[thing] = params[thing];
    
    var that = this;
    $('#new_job').click(function(e) { 
      e.preventDefault(); that.new_job_posting(); 
    });
    
    var that = this;
    var table = new IndexTable({    
      form_authenticity_token: this.form_authenticity_token,
      container: 'jobs',
      base_url: '/admin/companies/' + this.company_id + '/jobs',
      bulk_import_fields: [
        'Title', 'Job Type', 'City', 'State', 'Phone', 'Website', 'App URL', 'Description', 'Mini Description', 'Category IDs',
        'Category Auto Hauler', 	    
        'Category Company Driver', 	  
        'Category Dedicated',
        'Category Dry Van',
        'Category Flatbed',
        'Category Hazmat',
        'Category Intermodal',
        'Category Lease Purchase',
        'Category Local',
        'Category OTR',
        'Category Owner Operator',
        'Category Reefer',
        'Category Regional',
        'Category Specialized',
        'Category Student Driver',
        'Category Tanker',
        'Category Team Driver'
      ],
      bulk_import_url: '/admin/companies/' + this.company_id + '/jobs/bulk',
      fields: [
        { name: 'title'            , sort: 'title'            , show: true  , bulk_edit: false, nice_name: 'Title'            , type: 'text'              , value: function(job) { return job.title;                          }, width: 200 },
        { name: 'slug'             , sort: 'slug'             , show: false , bulk_edit: false, nice_name: 'Slug'             , type: 'text'              , value: function(job) { return job.slug;                           }, width: 200 },
        { name: 'job_type'         , sort: 'job_type'         , show: true  , bulk_edit: true , nice_name: 'Job type'         , type: 'select'            , value: function(job) { return job.job_type;                       }, width: 100 , options_url: '/admin/jobs/job-type-options' },
        { name: 'city'             , sort: 'city'             , show: true  , bulk_edit: true , nice_name: 'City'             , type: 'text'              , value: function(job) { return job.city;                           }, width: 200 },
        { name: 'state'            , sort: 'state'            , show: true  , bulk_edit: true , nice_name: 'State'            , type: 'select'            , value: function(job) { return job.state;                          }, width: 100 , options_url: '/admin/jobs/state-options' },
        { name: 'phone'            , sort: 'phone'            , show: false , bulk_edit: true , nice_name: 'Phone'            , type: 'text'              , value: function(job) { return job.phone;                          }, width: 200 },
        { name: 'website'          , sort: 'website'          , show: false , bulk_edit: true , nice_name: 'Website'          , type: 'text'              , value: function(job) { return job.website;                        }, width: 200 },
        { name: 'app_url'          , sort: 'app_url'          , show: false , bulk_edit: true , nice_name: 'App Link'         , type: 'text'              , value: function(job) { return job.app_url;                        }, width: 200 },      
        { name: 'date_available'   , sort: 'date_available'   , show: true  , bulk_edit: false, nice_name: 'Date available'   , type: 'date'              , value: function(job) { return to_date_string(job.date_available); }, width: 100 },
        { name: 'time_available'   , sort: 'date_available'   , show: false , bulk_edit: false, nice_name: 'Time available'   , type: 'time'              , value: function(job) { return to_time_string(job.date_available); }, width: 100 },
        { name: 'date_expires'     , sort: 'date_expires'     , show: false , bulk_edit: false, nice_name: 'Date expires'     , type: 'date'              , value: function(job) { return to_date_string(job.date_available); }, width: 100 },        
        { name: 'time_expires'     , sort: 'date_expires'     , show: false , bulk_edit: false, nice_name: 'Time expires'     , type: 'time'              , value: function(job) { return to_time_string(job.date_available); }, width: 100 },
        { name: 'description'      , sort: 'description'      , show: false , bulk_edit: true , nice_name: 'Description'      , type: 'richtext'          , value: function(job) { return job.description;                    }, width: 400, height: 200, text: function(job) { return strip_html(job.description     ).substr(0, 400); } },
        { name: 'mini_description' , sort: 'mini_description' , show: false , bulk_edit: true , nice_name: 'Mini description' , type: 'richtext'          , value: function(job) { return job.mini_description;               }, width: 400, height: 200, text: function(job) { return strip_html(job.mini_description).substr(0, 400); } },
        { name: 'cat_id'           , sort: 'id'               , show: false , bulk_edit: false, nice_name: 'Categories'       , type: 'checkbox-multiple' ,        
          options_url: '/admin/categories/options',
          value: function(job) { return job.categories.map(function(cat) { return cat.id }); },
          text: function(job) { return job.categories.map(function(cat) { return cat.name }).join(', '); },
          width: 400,
          height: 200        
        }
      ]    
    });
  }
  
};
