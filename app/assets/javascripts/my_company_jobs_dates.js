
var JobDatesController = function(params) { this.init(params); };
        
JobDatesController.prototype = {
  
  job_posting: false,
  job_posting_id: false,
  dacr: false, // date available change request
  decr: false, // date expires change request
  utc_offset: false,
  
  init: function(params)
  {
    for (var i in params)
      this[i] = params[i];
    this.refresh();
  },
  
  refresh: function()
  {
    var self = this;
    // Refresh the job posting    
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/json',
      type: 'get',    
      success: function(resp) { 
        self.job_posting = resp;
        if (self.job_posting.date_available)
        {
          self.job_posting.date_available = new Date(self.job_posting.date_available);          
          $('#da_current_value').html(self.job_posting.date_available.format('%m/%d/%Y %I:%M %P', self.utc_offset));
        }
        if (self.job_posting.date_expires)
        {
          self.job_posting.date_expires = new Date(self.job_posting.date_expires);          
          $('#de_current_value').html(self.job_posting.date_expires.format('%m/%d/%Y %I:%M %P', self.utc_offset));
        }        
      },
      async: false
    });
    // Refresh the change requests
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/change-requests/pending',
      type: 'get',    
      success: function(change_requests) {
        self.dacr = false;
        self.decr = false;
        if (change_requests && change_requests.length > 0)
        {          
          $.each(change_requests, function(i, cr) {                                    
            if (cr.field == 'date_available') self.dacr = cr;
            if (cr.field == 'date_expires')   self.decr = cr;
          });
        }                
        self.print_da_link();
        self.print_de_link();
      }
    });    
  },
  
  /******************************************************************************/
  
  print_da_link: function()
  {
    var self = this;
    var p = $('<p/>').addClass('note');
    if (self.dacr)
    {                  
      var d = new Date(self.dacr.parsed_new_value);
      p.append("You requested to change this to").append('<br/>');
      p.append(d.format('%m/%d/%Y %I:%M %P', self.utc_offset)).append('<br/>');
      p.append($('<a/>').attr('href','#').click(function(e) { self.cancel_da_change_request(); }).html('Cancel change request'));
    }
    else
    {          
      p.append($('<a/>').attr('href', '#').click(function(e) { self.add_da_change_request(); }).html('Request change'));
    }
    $('#da_message').empty().append(p);
  },
    
  add_da_change_request: function(d, confirm)
  {
    var self = this;
    if (!d)
    {
      var da = self.job_posting.date_available;    
      var p = $('<p/>').addClass('note')
        .append("You are requesting to change the date available field. ").append('<br/>')
        .append($('<input/>').attr('type', 'text').attr('id', 'da_date').css('width', '100px').val(da ? da.format('%m/%d/%Y', self.utc_offset) : '')).append(' ')
        .append($('<input/>').attr('type', 'text').attr('id', 'da_time').css('width', '100px').val(da ? da.format('%I:%M%P' , self.utc_offset) : '')).append('<br/>')      
        .append($('<input/>').attr('type', 'button').val('Request Change').click(function(e) { self.add_da_change_request($('#da_date').val() + ' ' + $('#da_time').val()); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('Cancel').click(function(e) { self.print_da_link(); }));
      $('#da_message').empty().append(p);
      $('#da_date').datepicker();
      $('#da_time').timepicker();
      return;
    }
    if (!confirm)
    {
      var p = $('<p/>').addClass('note')
        .append("Are you sure you want to request that the date available be " + d + "?").append('<br/>')            
        .append($('<input/>').attr('type', 'button').val('Yes').click(function(e) { self.add_da_change_request(d, true); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('No').click(function(e) { self.print_da_link(); }));      
      $('#da_message').empty().append(p);
      return;
    }
    $('#da_message').html("<p class='loading'>Requesting change...</p>");  
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/change-requests',
      type: 'post',
      data: { field: 'date_available', new_value: d },
      success: function(resp) {
        if (resp.error) $('#da_message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.success) self.refresh();
      }
    });  
  },
  
  cancel_da_change_request: function(confirm)
  {
    var self = this;
    if (!confirm)
    {
      var p = $('<p/>').addClass('note')
        .append("Are you sure you want to cancel this request?").append('<br/>')            
        .append($('<input/>').attr('type', 'button').val('Yes').click(function(e) { self.cancel_da_change_request(true); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('No').click(function(e) { $('#da_message').empty(); }));      
      $('#da_message').empty().append(p);
      return;
    }
    $('#da_message').html("<p class='loading'>Canceling requesting...</p>");  
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/change-requests/' + self.dacr.id,
      type: 'delete',    
      success: function(resp) {
        if (resp.error) $('#da_message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.success) self.refresh();
      }
    });  
  },
      
  /******************************************************************************/
  
  print_de_link: function()
  {
    var self = this;
    var p = $('<p/>').addClass('note');
    if (self.decr)
    {                  
      var d = new Date(self.decr.parsed_new_value);
      p.append("You requested to change this to").append('<br/>');
      p.append(d.format('%m/%d/%Y %I:%M %P', self.utc_offset)).append('<br/>');
      p.append($('<a/>').attr('href','#').click(function(e) { self.cancel_de_change_request(); }).html('Cancel change request'));
    }
    else
    {          
      p.append($('<a/>').attr('href', '#').click(function(e) { self.add_de_change_request(); }).html('Request change'));
    }
    $('#de_message').empty().append(p);
  },
  
  add_de_change_request: function(d, confirm)
  {
    var self = this;
    if (!d)
    {
      var de = self.job_posting.date_expires;    
      var p = $('<p/>').addClass('note')
        .append("You are requesting to change the date expires field. ").append('<br/>')
        .append($('<input/>').attr('type', 'text').attr('id', 'de_date').css('width', '100px').val(de ? de.format('%m/%d/%Y', self.utc_offset) : '')).append(' ')
        .append($('<input/>').attr('type', 'text').attr('id', 'de_time').css('width', '100px').val(de ? de.format('%I:%M%P' , self.utc_offset) : '')).append('<br/>')      
        .append($('<input/>').attr('type', 'button').val('Request Change').click(function(e) { self.add_de_change_request($('#de_date').val() + ' ' + $('#de_time').val()); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('Cancel').click(function(e) { self.print_de_link(); }));
      $('#de_message').empty().append(p);
      $('#de_date').datepicker();
      $('#de_time').timepicker();
      return;
    }
    if (!confirm)
    {
      var p = $('<p/>').addClass('note')
        .append("Are you sure you want to request that the date expires be " + d + "?").append('<br/>')            
        .append($('<input/>').attr('type', 'button').val('Yes').click(function(e) { self.add_de_change_request(d, true); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('No').click(function(e) { self.print_de_link(); }));      
      $('#de_message').empty().append(p);
      return;
    }
    $('#de_message').html("<p class='loading'>Requesting change...</p>");  
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/change-requests',
      type: 'post',
      data: { field: 'date_expires', new_value: d },
      success: function(resp) {
        if (resp.error) $('#de_message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.success) self.refresh();
      }
    });  
  },
  
  cancel_de_change_request: function(confirm)
  {
    var self = this;
    if (!confirm)
    {
      var p = $('<p/>').addClass('note')
        .append("Are you sure you want to cancel this request?").append('<br/>')            
        .append($('<input/>').attr('type', 'button').val('Yes').click(function(e) { self.cancel_de_change_request(true); })).append(' ')
        .append($('<input/>').attr('type', 'button').val('No').click(function(e) { $('#de_message').empty(); }));      
      $('#de_message').empty().append(p);
      return;
    }
    $('#de_message').html("<p class='loading'>Canceling requesting...</p>");  
    $.ajax({
      url: '/my-company/jobs/' + self.job_posting_id + '/change-requests/' + self.decr.id,
      type: 'delete',    
      success: function(resp) {
        if (resp.error) $('#de_message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.success) self.refresh();
      }
    });  
  }
  
};
