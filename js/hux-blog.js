/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

// Tooltip Init
$(function() {
    $("[data-toggle='tooltip']").tooltip();
});


// make all images responsive
/* 
 * Unuse by Hux
 * actually only Portfolio-Pages can't use it and only post-img need it.
 * so I modify the _layout/post and CSS to make post-img responsive!
 */
// $(function() {
// 	$("img").addClass("img-responsive");
// });

// responsive tables
$(document).ready(function() {
	$("table").wrap("<div class='table-responsive'></div>");
	$("table").addClass("table");
});

// responsive embed videos
$(document).ready(function () { 
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
	$('iframe[src*="youtube.com"]').addClass('embed-responsive-item');
    $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
	$('iframe[src*="vimeo.com"]').addClass('embed-responsive-item');
});

// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
    var MQL = 1170;

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
        // yangjg change we do not need show the navbar in intro-header layout
        // var headerHeight = $('.navbar-custom').height();
        var headerHeight = $('.intro-header').height();
        $(window).on('scroll', {
                previousTop: 0
            },
            function() {
                var currentTop = $(window).scrollTop();
                /** yangjg change the action of scroll
                //check if user is scrolling up
                if (currentTop < this.previousTop) {
                    //if scrolling up...
                    if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-visible');
                    } else {
                        $('.navbar-custom').removeClass('is-visible is-fixed');
                    }
                } else {
                    //if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) {
                        $('.navbar-custom').addClass('is-fixed');
                    }
                }
                **/
                if (currentTop < this.previousTop) {//if scrolling up...
                    if (currentTop <= headerHeight) {
                        if ($('.navbar-custom').hasClass('is-fixed')) {
                            $('.navbar-custom').removeClass('is-fixed');
                        } else if ($('.navbar-custom').hasClass('is-visible')) {
                            $('.navbar-custom').removeClass('is-visible');
                        } else if ($('.navbar-custom').hasClass('is-visible') && !$('.navbar-custom').hasClass('is-fixed')) {
                            $('.navbar-custom').removeClass('is-visible is-fixed');
                        }
                    }
                } else {//if scrolling down...
                    $('.navbar-custom').removeClass('is-visible');
                    if (currentTop > headerHeight) {
                        if (!$('.navbar-custom').hasClass('is-fixed')) {
                            $('.navbar-custom').addClass('is-fixed');
                        } else if (!$('.navbar-custom').hasClass('is-visible')) {
                            $('.navbar-custom').addClass('is-visible');
                        } else if (!$('.navbar-custom').hasClass('is-visible') && !$('.navbar-custom').hasClass('is-fixed')) {
                            $('.navbar-custom').addClass('is-visible is-fixed');
                        }
                    }
                }
                this.previousTop = currentTop;
            });
    }
});
