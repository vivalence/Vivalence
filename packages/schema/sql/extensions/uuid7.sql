-- https://gist.github.com/fabiolimace/515a0440e3e40efeb234e12644a6a346
/*
 * MIT License
 *
 * Copyright (c) 2023-2024 Fabio Lima
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 * 
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
 
/**
 * Returns a time-ordered UUID with Unix Epoch (UUIDv7).
 * 
 * Referencie: https://www.rfc-editor.org/rfc/rfc9562.html
 *
 * MIT License.
 *
 */
create or replace function uuid7() returns uuid as $$
declare
begin
	return uuid7(clock_timestamp());
end $$ language plpgsql;

create or replace function uuid7(p_timestamp timestamp with time zone) returns uuid as $$
declare

	v_time double precision := null;

	v_unix_t bigint := null;
	v_rand_a bigint := null;
	v_rand_b bigint := null;

	v_unix_t_hex varchar := null;
	v_rand_a_hex varchar := null;
	v_rand_b_hex varchar := null;

	c_milli double precision := 10^3;  -- 1 000
	c_micro double precision := 10^6;  -- 1 000 000
	c_scale double precision := 4.096; -- 4.0 * (1024 / 1000)
	
	c_version bigint := x'0000000000007000'::bigint; -- RFC-9562 version: b'0111...'
	c_variant bigint := x'8000000000000000'::bigint; -- RFC-9562 variant: b'10xx...'

begin

	v_time := extract(epoch from p_timestamp);

	v_unix_t := trunc(v_time * c_milli);
	v_rand_a := trunc((v_time * c_micro - v_unix_t * c_milli) * c_scale);
	v_rand_b := trunc(random() * 2^30)::bigint << 32 | trunc(random() * 2^32)::bigint;

	v_unix_t_hex := lpad(to_hex(v_unix_t), 12, '0');
	v_rand_a_hex := lpad(to_hex((v_rand_a | c_version)::bigint), 4, '0');
	v_rand_b_hex := lpad(to_hex((v_rand_b | c_variant)::bigint), 16, '0');

	return (v_unix_t_hex || v_rand_a_hex || v_rand_b_hex)::uuid;
	
end $$ language plpgsql;
-------------------------------------------------------------------
-- EXAMPLE:
-------------------------------------------------------------------
-- 
-- select uuid7() uuid, clock_timestamp()-statement_timestamp() time_taken;
--
-- |uuid                                  |time_taken        |
-- |--------------------------------------|------------------|
-- |018da240-e0db-72e1-86f5-345c2c240387  |00:00:00.000222   |
-- 

-------------------------------------------------------------------
-- EXAMPLE: generate a list
-------------------------------------------------------------------
-- 
-- with x as (select clock_timestamp() as t from generate_series(1, 1000))
-- select uuid7(x.t) uuid, x.t::text ts from x;
-- 
-- |uuid                                |ts                           |
-- |------------------------------------|-----------------------------|
-- |018da235-6271-70cd-a937-0bb7d22b801e|2024-02-13 08:23:44.113054-03|
-- |018da235-6271-7214-9188-1d3191883b5d|2024-02-13 08:23:44.113126-03|
-- |018da235-6271-723d-bebe-87f66085fad7|2024-02-13 08:23:44.113143-03|
-- |018da235-6271-728f-86ba-6e277d10c0a3|2024-02-13 08:23:44.113156-03|
-- |018da235-6271-72b8-9887-f31e4ca48020|2024-02-13 08:23:44.113168-03|
-- |018da235-6271-72e1-bbeb-8b686d0d4281|2024-02-13 08:23:44.113179-03|
-- |018da235-6271-730a-96a2-73275626f72a|2024-02-13 08:23:44.113190-03|
-- |018da235-6271-7333-8a5c-9d1ab89dc489|2024-02-13 08:23:44.113201-03|
-- |018da235-6271-735c-ba64-a42b55ad7d5c|2024-02-13 08:23:44.113212-03|
-- |018da235-6271-7385-a0fb-c65f5be24073|2024-02-13 08:23:44.113223-03|
--

-------------------------------------------------------------------
-- FOR TEST: the expected result is an empty result set
-------------------------------------------------------------------
-- 
-- with t as (select uuid7() as id from generate_series(1, 1000))
-- select * from t where (id is null or id::text !~ '^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');
--
