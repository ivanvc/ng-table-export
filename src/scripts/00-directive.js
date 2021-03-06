angular.module('ngTableExport', [])
.config(['$compileProvider', function($compileProvider) {
    // allow data links
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
}])
.directive('exportCsv', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var lineEnding = (attrs.exportCsvEnding && attrs.exportCsvEnding.indexOf('win')) ? '\r\n' : '\n';
            var separator = attrs.exportCsvSeparator || ';';
            var contentType = attrs.exportCsvContentType || 'text/csv';

            var data = '';
            var csv = {
                stringify: function(str) {
                    return '"' +
                        str.replace(/^\s\s*/, '').replace(/\s*\s$/, '') // trim spaces
                            .replace(/"/g,'""') + // replace quotes with double quotes
                        '"';
                },
                generate: function() {
                    data = '"sep=' + separator + '"' + lineEnding;
                    var rows = element.find('tr');
                    angular.forEach(rows, function(row, i) {
                        var tr = angular.element(row);
                        if (tr.hasClass('ng-table-filters')) {
                            return;
                        }
                        var tds = tr.find('th'),
                            rowData = '';
                        if (tds.length == 0) {
                            tds = tr.find('td');
                        }
                        if (i != 1) {
                            angular.forEach(tds, function(td, i) {
                                rowData += csv.stringify(angular.element(td).text()) + separator;
                            });
                            rowData = rowData.slice(0, rowData.length - 1); //remove last semicolon
                        }
                        data += rowData + lineEnding;
                    });
                },
                link: function() {
                    return 'data:' + contentType + ';charset=UTF-8,' + encodeURIComponent(data);
                }
            };
            $parse(attrs.exportCsv).assign(scope.$parent, csv);
        }
    };
}]);
