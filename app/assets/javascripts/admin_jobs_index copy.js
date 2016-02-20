
function to_date_string(x)
{
  if (!x) return ''; 
  var y = x.getFullYear();
  var m = x.getMonth() + 1;
  var d = x.getDate();      
  var str = y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;     
  return str;
}

function to_time_string(x)
{    
  if (!x) return '';
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

  jobs: [],
  job_ids: [],
  quick_edit_field: false,
  fields: [
    { show: true  , name: 'title'            , nice_name: 'Title'            , type: 'text'              , value: function(job) { return job.title;                          }, fixed_placeholder: false, width: 200 },
    { show: false , name: 'slug'             , nice_name: 'Slug'             , type: 'text'              , value: function(job) { return job.slug;                           }, fixed_placeholder: false, width: 200 },
    { show: true  , name: 'job_type'         , nice_name: 'Job type'         , type: 'select'            , value: function(job) { return job.job_type;                       }, fixed_placeholder: false, width: 100 , options_url: '/admin/jobs/job-type-options' },
    { show: true  , name: 'city'             , nice_name: 'City'             , type: 'text'              , value: function(job) { return job.city;                           }, fixed_placeholder: false, width: 200 },
    { show: true  , name: 'state'            , nice_name: 'State'            , type: 'select'            , value: function(job) { return job.state;                          }, fixed_placeholder: false, width: 100 , options_url: '/admin/jobs/state-options' },
    { show: false , name: 'phone'            , nice_name: 'Phone'            , type: 'text'              , value: function(job) { return job.phone;                          }, fixed_placeholder: false, width: 200 },
    { show: false , name: 'website'          , nice_name: 'Website'          , type: 'text'              , value: function(job) { return job.website;                        }, fixed_placeholder: false, width: 200 },
    { show: false , name: 'app_url'          , nice_name: 'App Link'         , type: 'text'              , value: function(job) { return job.app_url;                        }, fixed_placeholder: false, width: 200 },      
    { show: true  , name: 'date_available'   , nice_name: 'Date available'   , type: 'date'              , value: function(job) { return to_date_string(job.date_available); }, fixed_placeholder: false, width: 100 },
    { show: false , name: 'date_expires'     , nice_name: 'Date expires'     , type: 'date'              , value: function(job) { return to_time_string(job.date_available); }, fixed_placeholder: false, width: 100 },
    { show: false , name: 'time_available'   , nice_name: 'Time available'   , type: 'time'              , value: function(job) { return to_date_string(job.date_available); }, fixed_placeholder: false, width: 100 },
    { show: false , name: 'time_expires'     , nice_name: 'Time expires'     , type: 'time'              , value: function(job) { return to_time_string(job.date_available); }, fixed_placeholder: false, width: 100 },
    { show: false , name: 'description'      , nice_name: 'Description'      , type: 'richtext'          , value: function(job) { return job.description;                    }, fixed_placeholder: false, width: 400, height: 200, text: function(job) { return strip_html(job.description     ).substr(0, 400); } },
    { show: false , name: 'mini_description' , nice_name: 'Mini description' , type: 'richtext'          , value: function(job) { return job.mini_description;               }, fixed_placeholder: false, width: 400, height: 200, text: function(job) { return strip_html(job.mini_description).substr(0, 400); } },
    { show: true  , name: 'cat_id'           , nice_name: 'Categories'       , type: 'checkbox-multiple' ,
      height: 200,
      options_url: '/admin/categories/options',
      value: function(job) { return job.categories.map(function(cat) { return cat.id }); },
      text: function(job) { return job.categories.map(function(cat) { return cat.name }).join(', '); },
      fixed_placeholder: false, width: 400,
      empty_text: 'No categories'
    },
  ],

  init: function(params) {
    for (var thing in params)
      this[thing] = params[thing];
    
    var that = this;
    $('#new_job'    ).click(function(e) { e.preventDefault(); that.new_job_posting(); });              
    $('#bulk_edit'  ).click(function(e) { that.bulk_edit();   });
    $('#bulk_delete').click(function(e) { that.bulk_delete(); });
    $('#duplicate'  ).click(function(e) { that.duplicate();   });
    $('#toggle_cols').click(function(e) { e.preventDefault(); $('#columns').slideToggle(); });
    this.print_cols();
    this.refresh_jobs();
  },

  refresh_jobs: function()
  {
    var that = this;
    $('#jobs').html("<p class='loading'>Refreshing jobs...</p>");
    $.ajax({ 
      url: '/admin/companies/' + this.company_id + '/jobs/json',
      type: 'get',    
      success: function(resp) {
        that.jobs = resp;
        $.each(that.jobs, function(i, job) {
          job.id = parseInt(job.id);
          if (job.date_available) job.date_available = new Date(job.date_available);
          if (job.date_expires)   job.date_expires   = new Date(job.date_expires);
        });
        that.print_jobs();
      },
      error: function() { $('#jobs').html("<p class='note error'>Error retrieving jobs.</p>"); }
    });
  },
  
  print_jobs: function()
  {
    var that = this;
    var tbody = $('<tbody/>');
    
    // Print the column headers
    var tr = $('<tr/>').append($('<th/>').html('&nbsp;'));
    $.each(this.fields, function(i, field) {
      if (field.show)
      {
        var input = $('<input/>').attr('type', 'checkbox').attr('id', 'quick_edit_' + field.name).val(field.name)            
          .change(function() {
            that.quick_edit_field = $(this).prop('checked') ? $(this).val() : false;
            that.refresh_jobs(); 
          });
        if (field.name == that.quick_edit_field)
          input.prop('checked', 'true');         
        tr.append($('<th/>').append(input).append('<br/>').append(field.nice_name));
      }        
    });
    tbody.append(tr);
    
    // Print the job rows    
    $.each(that.jobs, function(i, job) {
            
      var checkbox = $('<input/>').attr('type', 'checkbox').attr('id', 'job_' + job.id)        
        .click(function(e) {           
          e.stopPropagation();
          var job_id = $(this).attr('id').replace('job_', '');          
          if (job_id == 'NaN')
            alert("Error: invalid job id.");
          else
          {
            job_id = parseInt(job_id);
            var checked = $(this).prop('checked');
            var i = that.job_ids.indexOf(job_id);                    
            if (checked && i == -1) that.job_ids.push(job_id);
            if (!checked && i > -1) that.job_ids.splice(i, 1);
          }
        });
      if (that.job_ids.indexOf(job.id) > -1)
        checkbox.prop('checked', 'true');      
      
      var tr = $('<tr/>')
        .attr('id', 'job_row_' + job.id)                
        .append($('<td/>').append(checkbox));
      if (!that.quick_edit_field)
      {
        tr.click(function(e) {           
          var job_id = $(this).attr('id').replace('job_row_', '');
          window.location = '/admin/companies/' + that.company_id + '/jobs/' + job_id;                    
        });
      }
        
      $.each(that.fields, function(j, field) {
        if (field.show)
        {
          var td = $('<td/>');
          if (that.quick_edit_field == field.name)
            td.append($('<div/>').attr('id', 'jobposting_' + job.id + '_' + field.name));
          else            
          {            
            td.html(field.text ? field.text(job) : field.value(job));
          }
          tr.append(td);
        }
      });
      tbody.append(tr);
    });                                
    var table = $('<table/>').addClass('data').append(tbody);
    $('#jobs').empty().append(table).append('<br/>');
    
    if (that.quick_edit_field)
    {
      $.each(that.jobs, function(i, job) {
        $.each(that.fields, function(j, field) {
          if (field.show && field.name == that.quick_edit_field)
          {            
            var attrib = $.extend({}, field);
            attrib['value'] = field.value(job);
            //if (field.text)
            //  attrib['text'] = field.text(job);
            new ModelBinder({
              name: 'JobPosting',
              id: job.id,
              update_url: '/admin/companies/' + that.company_id + '/jobs/' + job.id,
              authenticity_token: this.form_authenticity_token,
              attributes: [attrib]
            });
          }
        });
      });
    }
  },

  new_job_posting: function()
  {
    var that = this;
    var form = $('<form/>').attr('id', 'new_job_form')
      .append($('<input/>').attr('type', 'hidden').attr('name', 'authenticity_token').val(this.form_authenticity_token))  
      .append($('<p/>').append($('<input/>').attr('type', 'text').attr('name', 'title').attr('placeholder', 'Job Title' ).css('width', '500px')))
      .append($('<p/>').append($('<input/>').attr('type', 'text').attr('name', 'city' ).attr('placeholder', 'City'      ).css('width', '500px')))
      .append($('<p/>').append($('<input/>').attr('type', 'text').attr('name', 'state').attr('placeholder', 'State'     ).css('width', '500px')))
      .append($('<div/>').attr('id', 'new_job_message'))
      .append($('<p>')        
        .append($('<input/>').attr('type', 'button').val('Cancel').click(function(e) { $('#new_job_form_container').empty(); }))
        .append(' ')
        .append($('<input/>').attr('type', 'submit').val('Add New Job Posting').click(function(e) { that.add_job_posting(); return false; }))
      );
    $('#new_job_form_container').empty().append(form);
  },
    
  add_job_posting: function() 
  {
    $('#new_message').html("<p class='loading'>Adding job posting...</p>");
    $.ajax({
      url: '/admin/companies/' + this.company_id + '/jobs',
      type: 'post',
      data: $('#new_job_form').serialize(),
      success: function(resp) {
        if (resp.error) $('#new_message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.redirect) window.location = resp.redirect;
      }
    });
  },

  bulk_edit: function()
  {
    if (this.job_ids.length == 0)
    {
      $('#message').html("<p class='note error'>Please select at least one job.</p>");
      return;
    }   
    var div = $('<div/>')
      .append($('<h2/>').html('Bulk Edit Jobs'))
      .append($('<p/>').html('Any change you make the fields below will apply to all the selected jobs.'))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_job_type' )))   
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_city'     )))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_state'    )))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_phone'    )))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_website'  )))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_app_url'  )))
      .append($('<p/>').append($('<div/>').attr('id', 'bulkjob_1_premium'  )))
      .append($('<input/>').attr('type','button').val('Finished').click(function() { $('#message').empty(); }));    
    $('#message').empty().append(div);
    
    var that = this;
    var params = this.job_ids.map(function(job_id) { return 'job_ids[]=' + job_id; }).join('&');  
    m = new ModelBinder({
      name: 'BulkJob',
      id: 1,
      update_url: '/admin/companies/' + this.company_id + '/jobs/bulk?' + params,
      authenticity_token: this.form_authenticity_token,
      attributes: [      
        { name: 'job_type' , nice_name: 'Job type'  , type: 'select'   , value: '', width: 800 , after_update: function() { that.refresh_jobs(); }, options_url: '/admin/jobs/job-type-options' },
        { name: 'city'     , nice_name: 'City'      , type: 'text'     , value: '', width: 800 , after_update: function() { that.refresh_jobs(); } },
        { name: 'state'    , nice_name: 'State'     , type: 'select'   , value: '', width: 800 , after_update: function() { that.refresh_jobs(); }, options_url: '/admin/jobs/state-options' },
        { name: 'phone'    , nice_name: 'Phone'     , type: 'text'     , value: '', width: 800 , after_update: function() { that.refresh_jobs(); } },
        { name: 'website'  , nice_name: 'Website'   , type: 'text'     , value: '', width: 800 , after_update: function() { that.refresh_jobs(); } },
        { name: 'app_url'  , nice_name: 'App Link'  , type: 'text'     , value: '', width: 800 , after_update: function() { that.refresh_jobs(); } },
      ]
    });
  },
  
  bulk_delete: function(confirm)
  {
    var that = this;
    if (this.job_ids.length == 0)
    {
      $('#message').html("<p class='note error'>Please select at least one job.</p>");
      return;
    } 
    if (!confirm)
    {
      var p = $('<p/>').addClass('note').addClass('warning')
        .append('Are you sure you want to delete the selected jobs? ')      
        .append($('<input/>').attr('type','button').val('Yes').click(function() { that.bulk_delete(true); }))
        .append($('<input/>').attr('type','button').val('No').click(function() { $('#message').empty(); }));
      $('#message').empty().append(p);
      return;
    }        
    var params = this.job_ids.map(function(job_id) { return 'job_ids[]=' + job_id; }).join('&');
    $('#jobs').html("<p class='loading'>Refreshing jobs...</p>");
    $.ajax({ 
      url: '/admin/companies/' + this.company_id + '/jobs/bulk',
      type: 'delete',
      data: {
        job_ids: that.job_ids
      },
      success: function(resp) {
        $('#message').empty();
        that.refresh_jobs();        
      }      
    });        
  },
  
  job_for_id: function(job_id)
  {
    for (var i=0; i<this.jobs.length; i++)
      if (this.jobs[i].id == job_id)
        return this.jobs[i];
    return false;
  },
  
  print_cols: function()
  {
    var that = this;
    var div = $('<div/>').attr('id', 'columns');
    $.each(this.fields, function(i, field) {
      var input = $('<input/>')
        .attr('type', 'checkbox')
        .attr('id', 'field_' + field.name)
        .click(function(e) {                      
          var field_name = $(this).attr('id').replace('field_', '');          
          var checked = $(this).prop('checked');                    
          $.each(that.fields, function(j, f) {            
            if (f.name == field_name)
            {
              f.show = checked;
              that.print_jobs();
            }      
          });               
        });        
      if (field.show)
        input.prop('checked', 'true');      
      
      div.append($('<div/>').addClass('label_with_checkbox')
        .append(input)
        .append($('<label/>').attr('for', 'field_' + field.name).html(field.nice_name))
      );
    });    
    $('#columns').replaceWith(div);
    $('#columns').hide();
  },
  
  duplicate: function(count)
  {
    var that = this;        
    if (this.job_ids.length == 0)
    {
      var p = $('<p/>').addClass('note error').html("Please select a job.");
      $('#message').empty().append(p);
      return;
    }
    if (this.job_ids.length > 1)
    {
      var p = $('<p/>').addClass('note error').html("Please select a single job.");
      $('#message').empty().append(p);
      return;
    }
    if (!count)
    {
      var p = $('<p/>').addClass('note')
        .append('How many times do you want this job duplicated?')          
        .append($('<input/>').attr('type', 'text').attr('id', 'count').css('width', '50'))
        .append('<br />')
        .append($('<input/>').attr('type', 'button').val('Cancel').click(function(e) { $('#message').empty(); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('Duplicate').click(function(e) { that.duplicate($('#count').val()); return false; }));
      $('#message').empty().append(p);
      return;      
    }    
    $('#message').html("<p class='loading'>Duplicating jobs...</p>");
    $.ajax({
      url: '/admin/companies/' + this.company_id + '/jobs/' + that.job_ids[0] +'/duplicate',
      type: 'post',
      data: { count: count },
      success: function(resp) {
        if (resp.error) $('#message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.success) { $('#message').empty(); that.refresh_jobs(); }
      }
    });    
  }
  
};
