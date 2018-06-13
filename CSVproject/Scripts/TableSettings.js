// 
function ShowFileSettings(fileName) {
    
    $.ajax({
        url: '/Home/GetCSVfileHeaders',
        type: 'GET',
        dataType: 'json',
        data: { 'fileName': fileName },
        success: function (d) {
            if (d.length > 0) {
                var $data = $('<table id="generatedTable"></table>').addClass('table table-responsive table-striped');
                var header = "<thead><tr><th id='original'>Оригинал</th><th id='standart'>Стандарт</th><th></th></tr></thead>";
                $data.append(header);

                $.each(d, function (i, columnName) {
                    var select = $('<select onchange="onSelectedValueChanged()"></select>').addClass('dropDownList');
                    select.append($('<option value="NoMapped">NoMapped</option>'));
                    select.append($('<option value="Ignore Column">Ignore Column</option>'));

                    var $row = $('<tr class="generatedRow" ></tr>');
                    $row.append($('<td/>').addClass('originalCol').html(columnName));

                    select.append($('<option value="' + columnName + '">' + columnName + '</option>'));
                    var td = $('<td></td>');
                    $row.append(td.append(select));

                    var labelAttention = $('<label class="display_attention"> ! </label>');
                    var labelAccepted = $('<label class="display_accepted"> ✓ </label>');
                    if (columnName.toLowerCase() == 'sku' || columnName.toLowerCase() == 'brand' || columnName.toLowerCase() == 'price') {
                        var labelRequired = $('<label class="display_required">Это поле обязательно для сопоставления</label>');
                        td = $('<td></td>');
                        td.append(labelRequired);
                        td.append(labelAccepted);
                        $row.append(td);
                    } else {
                        td = $('<td></td>');
                        td.append(labelAttention);
                        td.append(labelAccepted);
                        $row.append(td);
                    }
                    $data.append($row);
                });              
                $('#update_panel').html($data);
                $('#update_panel').append('<button onclick="loadDataToDB(\'' + fileName +'\')">Load data to DB</button>');
            }
            else {
                
                var $noData = $('<div/>').html("<hr><center><p>You don't have any calculations history data now!</p></center>").addClass('noData');
                $('#update_panel').html($noData);
            }
        },
        error: function () {
            alert('Error! Please try again.');
        }
    });

};

function onSelectedValueChanged() {
    var activeElement = $('.dropDownList').context.activeElement;
    var selectedValue = activeElement.value;
    var verifyColumn = activeElement.closest("tr").cells[0].innerText;

    if (verifyColumn.toLowerCase() == 'sku' || verifyColumn.toLowerCase() == 'brand' || verifyColumn.toLowerCase() == 'price') {
        if (selectedValue != verifyColumn) {
            $(activeElement.closest("tr")).find(".display_accepted").hide();
            $(activeElement.closest("tr")).find(".display_required").show();
        } else {
            $(activeElement.closest("tr")).find(".display_required").hide();
            $(activeElement.closest("tr")).find(".display_accepted").show();
        }
    } else {
        if (selectedValue != verifyColumn) {
            $(activeElement.closest("tr")).find(".display_accepted").hide();
            $(activeElement.closest("tr")).find(".display_attention").show();
        } else {
            $(activeElement.closest("tr")).find(".display_attention").hide();
            $(activeElement.closest("tr")).find(".display_accepted").show();
        }
    }
};

function loadDataToDB(fileName) {
    var selectedOptions = $('.dropDownList');
    var nextStep = false;
    var columnsStr = '';

    var originalCols = [];
    var standartCols = [];

    $.each(selectedOptions, function (i, selectedOption) {
        var verifyColumn = selectedOption.closest("tr").cells[0].innerText;
        var selectedValue = selectedOption.value;
        var obj = {};

        if (verifyColumn.toLowerCase() == 'sku' || verifyColumn.toLowerCase() == 'brand' || verifyColumn.toLowerCase() == 'price') {
            if (selectedValue != verifyColumn) {
                $(selectedOption.closest("tr")).find(".display_accepted").hide();
                $(selectedOption.closest("tr")).find(".display_required").show();
                nextStep = false;
            } else {
                $(selectedOption.closest("tr")).find(".display_required").hide();
                $(selectedOption.closest("tr")).find(".display_accepted").show();

                columnsStr += selectedValue + ';';
                originalCols.push(verifyColumn);
                standartCols.push(selectedValue);
                //obj[verifyColumn] = selectedValue;
                //columns.push(obj);
                nextStep = true;
            }
        } else {
            if (selectedValue != verifyColumn) {
                $(selectedOption.closest("tr")).find(".display_attention").show();
            } else {
                originalCols.push(verifyColumn);
                standartCols.push(selectedValue);
                columnsStr += selectedValue + ';';
                //obj[verifyColumn] = selectedValue;
                //columns.push(obj);

                $(selectedOption.closest("tr")).find(".display_attention").hide();
                $(selectedOption.closest("tr")).find(".display_accepted").show();
            }
        }
    });

    if (nextStep) {
        if (confirm('Are you sure you want to load data according to current settings into the database?')) {
            // Save it!
            $.ajax({
                url: '/Home/LoadCSVdataToDB',
                type: 'GET',
                dataType: 'json',
                data: { 'fileName': fileName, 'columns': columnsStr },//JSON.stringify(columns)
                success: function (d) {
                    alert('The data has been imported to DB successfully');
                },
                error: function () {
                    alert('Error occured during importing data to DB! Please try again.');
                }
            });
        }
    } else {
        alert('You have reqired columns to map. Please specify your settings!');
    }
}