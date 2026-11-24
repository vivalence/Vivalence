#!/usr/bin/perl
# limit: 1200 chars · each bare view · views · View · Views hit keyed by what stands left and right of it, counted. args: files on stdin
use strict;
use warnings;

my %seen;
my %where;
while (my $file = <STDIN>) {
  chomp $file;
  open(my $handle, '<', $file) or next;
  while (my $row = <$handle>) {
    while ($row =~ /((?:[A-Za-z_\$][\w\$]*)?[.\/"'`{(\[:,<#\-]?\s?)\b(views?|Views?)\b(\s?[.\/"'`})\]:,>=(\-]?(?:[A-Za-z_\$][\w\$]*)?)/g) {
      my ($left, $word, $right) = ($1, $2, $3);
      $right =~ s/^(\s?[^\w\s]?)[\w\$]+$/$1~/ unless $right =~ /^\s?[.\/]/;
      my $key = "$left$word$right";
      $seen{$key}++;
      $where{$key}{$file} = 1;
    }
  }
  close $handle;
}

for my $key (sort { $seen{$b} <=> $seen{$a} || $a cmp $b } keys %seen) {
  printf "%5d %3d  %s\n", $seen{$key}, scalar(keys %{ $where{$key} }), $key;
}
