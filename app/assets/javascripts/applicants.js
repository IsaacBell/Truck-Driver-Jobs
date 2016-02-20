
var ApplicantsController = function() {
  this.set_row_click();
};

ApplicantsController.prototype = {
  
  checked_applicant_ids: function()
  {
    var ids = [];
    $('#applicants td input[type=checkbox]').each(function(i, el) {      
      if ($(el).prop('checked'))
      {        
        var id = $(el).attr('id');
        id = id.replace('applicant_', '');
        ids[ids.length] = id;
      }
    });
    return ids;
  },
  
  check_all: function(checked)
  {
    $('#applicants td input[type=checkbox]').prop('checked', checked);
  },
  
  mass_approve: function(approved)
  {  
    var ids = this.checked_applicant_ids();    
    if (ids.length == 0)
    {
      $('#message').html("<p class='note error'>You must select at least one applicant.</p>");
      return;
    }
    
    $('#message').html("<p class='loading'>Approving applicants...</p>");
    $.ajax({
      url: '/applicants/mass-approve',
      type: 'put',
      data: { 
        applicant_ids: ids,
        approved: approved
      },
      success: function(resp) {
        if (resp.error) $('#message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.reload) window.location.reload(true); 
      }
    });
  },
  
  mass_delete: function(confirm)
  {
    var that = this;
    var ids = this.checked_applicant_ids();
    if (ids.length == 0)
    {
      $('#message').html("<p class='note error'>You must select at least one applicant.</p>");
      return;
    }
    if (!confirm)
    {
      var p = $('<p/>').addClass('note warning')
        .append("Are you sure you want to delete the selected applicants.  This can't be undone.")
        .append($('<input/>').attr('type','button').val('Yes').click(function() { that.mass_delete(true); })).append(' ')
        .append($('<input/>').attr('type','button').val('No' ).click(function() { $('#message').empty(); }));
      $('#message').empty().append(p);
      return;
    }  
    
    $('#message').html("<p class='loading'>Deleting applicants...</p>");
    $.ajax({
      url: '/applicants/mass-delete',
      type: 'delete',
      data: { applicant_ids: ids },
      success: function(resp) {
        if (resp.error) $('#message').html("<p class='note error'>" + resp.error + "</p>");
        if (resp.reload) window.location.reload(true); 
      }
    });
  },
  
  set_row_click: function()
  {
    $('#applicants td[class!=checkbox]').click(function() {
      var id = $(this).parent().attr('id').replace('applicant_row_', '');
      window.location = '/applicants/' + id;
    });
  }
  
};

var controller = new ApplicantsController();
